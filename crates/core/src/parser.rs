use crate::lexer::{self, OwnedToken, Token};
use crate::query::{AtomicQueryKey, Query, QueryKey};
use logos::{Logos, Span, SpannedIter};
use std::borrow::Cow;
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
    #[error("Query construction error: {0}")]
    Construction(crate::query::Error, Span),
}

impl Error {
    pub fn span(&self) -> &Span {
        match self {
            Self::UnexpectedToken { span, .. } => span,
            Self::UnexpectedEndOfInput(span) => span,
            Self::UnexpectedTokenAfterRootQuery(span) => span,
            Self::Lexer(_, span) => span,
            Self::Construction(_, span) => span,
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

    fn current_span(&mut self) -> Result<Span> {
        let (_, span) = self.peek()?;
        Ok(span)
    }

    fn span_between(&self, start: Span, end: Span) -> Span {
        start.start..end.end
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
            (Token::LBrace, root_query_start_span) => {
                self.consume();
                let children = self.parse_query_content(&Token::RBrace)?;
                let root_query_end_span = self.current_span()?;
                self.consume();

                let root_query_span = self.span_between(root_query_start_span, root_query_end_span);
                Query::unnamed_with_children(children)
                    .map_err(|err| Error::Construction(err, root_query_span))
            }
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
    /// `QUERY -> QUERY_KEY QUERY_ALIAS| QUERY_KEY QUERY_ALIAS { QUERY_CONTENT }
    fn parse_query(&mut self) -> Result<Query<'src>> {
        let query_span_start = self.current_span()?;
        let query_key = self.parse_query_key()?;
        let query_alias = self.parse_query_alias()?;

        match self.peek()? {
            (Token::LBrace, _) => {
                self.consume();
                let children = self.parse_query_content(&Token::RBrace)?;
                let query_span_end = self.current_span()?;
                self.consume();

                let query_span = self.span_between(query_span_start, query_span_end);
                Query::named_with_children(query_alias, query_key, children)
                    .map_err(|err| Error::Construction(err, query_span))
            }
            _ => Ok(Query::named_empty(query_alias, query_key)),
        }
    }

    /// # Grammar
    /// QUERY_KEY -> key . QUERY_KEY | key
    fn parse_query_key(&mut self) -> Result<QueryKey<'src>> {
        let mut keys = Vec::new();
        loop {
            match self.next_token()? {
                (Token::Key(key), _) => keys.push(AtomicQueryKey::new(Cow::Borrowed(key))),
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

    /// # Grammar
    /// QUERY_ALIAS -> : key | ε
    fn parse_query_alias(&mut self) -> Result<Option<AtomicQueryKey<'src>>> {
        match self.peek()? {
            (Token::Colon, _) => {
                self.consume();
                match self.next_token()? {
                    (Token::Key(key), _) => Ok(Some(AtomicQueryKey::new(Cow::Borrowed(key)))),
                    (unexpected_token, span) => Err(Error::UnexpectedToken {
                        found: unexpected_token.into(),
                        span,
                    }),
                }
            }
            _ => Ok(None),
        }
    }
}

impl<'a> TryFrom<&'a str> for Query<'a> {
    type Error = Error;

    fn try_from(value: &'a str) -> Result<Self> {
        Parser::new(value).parse()
    }
}
