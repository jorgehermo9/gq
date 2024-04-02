use crate::lexer::{self, OwnedToken, Token};
use crate::query::{AtomicQueryKey, Query, QueryKey};
use logos::{Logos, Span, SpannedIter};
use std::iter::Peekable;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;
type SpannedToken<'src> = (Token<'src>, Span);
type SpannedTokenRef<'a, 'src> = (&'a Token<'src>, Span);

#[derive(Error, Debug)]
pub enum Error {
    #[error("Unexpected token '{found}'")]
    UnexpectedToken { found: OwnedToken, span: Span },
    #[error("Unexpected end of input")]
    UnexpectedEndOfInput(Span),
    #[error("Unexpected token after root query")]
    UnexpectedTokenAfterRootQuery(Span),
    #[error("Lexer Error: {0}")]
    Lexer(lexer::Error, Span),
}

impl Error {
    pub fn span(&self) -> &Span {
        match self {
            Self::UnexpectedToken { span, .. } => span,
            Self::UnexpectedEndOfInput(span) => span,
            Self::UnexpectedTokenAfterRootQuery(span) => span,
            Self::Lexer(_, span) => span,
        }
    }
}

pub struct Parser<'src> {
    lexer: Peekable<SpannedIter<'src, Token<'src>>>,
    source: &'src str,
}

impl<'src> Parser<'src> {
    pub fn new(source: &'src str) -> Self {
        Self {
            lexer: Token::lexer(source).spanned().peekable(),
            source,
        }
    }

    pub fn parse(&mut self) -> Result<Query<'src>> {
        let query = self.parse_root_query()?;

        if self.lexer.next().is_some() {
            // TODO: use this error or the generic one?
            return Err(Error::UnexpectedTokenAfterRootQuery(self.last_span()));
        }

        Ok(query)
    }

    fn last_span(&self) -> Span {
        self.source.len()..self.source.len()
    }

    fn peek<'a>(&'a mut self) -> Result<SpannedTokenRef<'a, 'src>> {
        match self.lexer.peek() {
            Some((token, span)) => {
                let token = token
                    .as_ref()
                    .map_err(|err| Error::Lexer(err.clone(), span.clone()))?;
                Ok((token, span.clone()))
            }
            None => Ok((&Token::EOF, self.source.len()..self.source.len())),
        }
    }

    fn consume(&mut self) {
        let _ = self.next_token();
    }

    fn next_token(&mut self) -> Result<SpannedToken<'src>> {
        let spanned_token = self
            .lexer
            .next()
            .ok_or_else(|| Error::UnexpectedEndOfInput(self.last_span()))?;

        let (token, span) = spanned_token;
        let token = token.map_err(|err| Error::Lexer(err, span.clone()))?;
        Ok((token, span))
    }

    /// # Grammar
    /// `S -> QUERY | { QUERY_CONTENT }`
    fn parse_root_query(&mut self) -> Result<Query<'src>> {
        match self.peek()? {
            (Token::LBrace, _) => {
                self.consume();
                let children = self.parse_query_content(&Token::RBrace)?;
                // We know the next token is a closing brace, so we can consume it
                self.consume();
                Ok(Query::unnamed_with_children(children))
            }
            // If the next token is not a brace, we try to parse a query
            _ => self.parse_query(),
        }
    }

    /// # Grammar
    /// `QUERY_CONTENT -> QUERY QUERY_CONTENT | ε`
    fn parse_query_content(&mut self, stop_token: &Token) -> Result<Vec<Query<'src>>> {
        let mut queries = Vec::new();

        loop {
            match self.peek()? {
                (token, _) if token == stop_token => return Ok(queries),
                _ => {
                    let query = self.parse_query()?;
                    queries.push(query);
                }
            }
        }
    }

    /// # Grammar
    /// `QUERY -> QUERY_KEY | QUERY_KEY { QUERY_CONTENT }
    fn parse_query(&mut self) -> Result<Query<'src>> {
        let query_key = self.parse_query_key()?;
        match self.peek()? {
            (Token::LBrace, _) => {
                self.consume();
                let children = self.parse_query_content(&Token::RBrace)?;
                self.consume();
                Ok(Query::named_with_children(query_key, children))
            }
            _ => Ok(Query::named_empty(query_key)),
        }
    }

    /// # Grammar
    /// QUERY_KEY -> key . QUERY_KEY | key
    fn parse_query_key(&mut self) -> Result<QueryKey<'src>> {
        let mut keys = Vec::new();

        loop {
            match self.next_token()? {
                (Token::Key(key), _) => keys.push(AtomicQueryKey::new(key)),
                (unexpected_token, span) => {
                    return Err(Error::UnexpectedToken {
                        found: unexpected_token.into(),
                        span,
                    })
                }
            }

            match self.peek()? {
                (Token::Dot, _) => {
                    self.consume();
                }
                _ => return Ok(QueryKey::new(keys)),
            }
        }
    }
}

impl<'a> TryFrom<&'a str> for Query<'a> {
    type Error = Error;

    fn try_from(value: &'a str) -> Result<Self> {
        Parser::new(value).parse()
    }
}
