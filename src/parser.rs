use logos::{Logos, Span, SpannedIter};
use std::fmt::{self, Display, Formatter};
use std::iter::Peekable;
use thiserror::Error;

use crate::lexer::{LexerError, OwnedToken, Token};
use crate::query::Query;

type ParserResult<T> = Result<T, ParserError>;
type SpannedToken<'src> = (Token<'src>, Span);
type SpannedTokenRef<'a, 'src> = (&'a Token<'src>, Span);

#[derive(Debug)]
pub struct ExpectedTokens(Vec<OwnedToken>);

impl Display for ExpectedTokens {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self.0.split_last() {
            Some((last, [])) => write!(f, "'{last}'"),
            Some((last, rest)) => {
                for token in rest {
                    write!(f, "'{token}', ")?;
                }
                write!(f, "or '{last}'")
            }
            None => write!(f, "nothing"),
        }
    }
}

#[derive(Error, Debug)]
pub enum ParserError {
    #[error("Unexpected token '{found}'. Expecting {expected}")]
    UnexpectedToken {
        // TODO: Can this be done with Token instead of OwnedToken?
        // Maybe some lifetime handling... ParserError<'src>? This should work
        // like Query<'src> works...

        // RETHINK: maybe we should not have expecting tokens...
        expected: ExpectedTokens,
        found: OwnedToken,
        span: Span,
    },
    #[error("Unexpected end of input")]
    UnexpectedEndOfInput(Span),
    #[error("Unexpected token after root query")]
    UnexpectedTokenAfterRootQuery(Span),
    #[error("Expected closing brace")]
    ExpectedClosingBrace(Span),
    #[error("Expected opening brace or key")]
    ExpectedOpeningBraceOrKey(Span),
    #[error("Lexer Error: {0}")]
    Lexer(LexerError, Span),
}

impl ParserError {
    pub fn span(&self) -> &Span {
        match self {
            Self::UnexpectedToken { span, .. } => span,
            Self::UnexpectedEndOfInput(span) => span,
            Self::UnexpectedTokenAfterRootQuery(span) => span,
            Self::ExpectedClosingBrace(span) => span,
            Self::ExpectedOpeningBraceOrKey(span) => span,
            Self::Lexer(_, span) => span,
        }
    }
}

pub struct Parser<'src> {
    lexer: Peekable<SpannedIter<'src, Token<'src>>>,
    current_token: Option<SpannedToken<'src>>,
    previous_token: Option<SpannedToken<'src>>,
    source: &'src str,
}

impl<'src> Parser<'src> {
    pub fn new(source: &'src str) -> Self {
        Self {
            lexer: Token::lexer(source).spanned().peekable(),
            current_token: None,
            previous_token: None,
            source,
        }
    }

    pub fn parse(&mut self) -> ParserResult<Query<'src>> {
        let query = self.parse_root_query()?;

        if self.lexer.next().is_some() {
            // TODO: use this error or the generic one?
            return Err(ParserError::UnexpectedTokenAfterRootQuery(self.last_span()));
        }

        Ok(query)
    }

    fn last_span(&self) -> Span {
        self.source.len()..self.source.len()
    }

    // TODO: have a scanner that wraps the lexer and provides a peek method and error conversion?
    fn peek<'a>(&'a mut self) -> ParserResult<SpannedTokenRef<'a, 'src>> {
        match self.lexer.peek() {
            Some((token, span)) => {
                let token = token
                    .as_ref()
                    .map_err(|err| ParserError::Lexer(err.clone(), span.clone()))?;
                Ok((token, span.clone()))
            }
            None => Ok((&Token::EOF, self.source.len()..self.source.len())),
        }
    }

    fn consume(&mut self) {
        let _ = self.next_token();
    }

    fn next_token(&mut self) -> ParserResult<SpannedToken<'src>> {
        // TODO: remove this...
        self.previous_token = self.current_token.take();
        let spanned_token = self
            .lexer
            .next()
            .ok_or_else(|| ParserError::UnexpectedEndOfInput(self.last_span()))?;

        let (token, span) = spanned_token;
        let token = token.map_err(|err| ParserError::Lexer(err, span.clone()))?;
        // TODO: check if this clone is correct and does not allocate too much...
        self.current_token = Some((token.clone(), span.clone()));
        Ok((token, span))
    }

    /// # Grammar
    /// `S -> QUERY | { QUERY_CONTENT }`
    fn parse_root_query(&mut self) -> ParserResult<Query<'src>> {
        match self.peek()? {
            (Token::BraceOpen, _) => {
                self.consume();
                let children = self.parse_query_content(&Token::BraceClose)?;
                // We know the next token is a closing brace, so we can consume it
                self.consume();
                Ok(Query::root_with_children(children))
            }
            // If the next token is not a brace, we try to parse a query
            _ => self.parse_query(),
        }
    }

    /// # Grammar
    /// `QUERY_CONTENT -> QUERY QUERY_CONTENT | ε`
    fn parse_query_content(&mut self, stop_token: &Token) -> ParserResult<Vec<Query<'src>>> {
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
    /// `QUERY -> key | key { QUERY_CONTENT } | (key error)??`
    fn parse_query(&mut self) -> ParserResult<Query<'src>> {
        match self.next_token()? {
            (Token::Key(key), _) => match self.peek()? {
                (Token::BraceOpen, _) => {
                    self.consume();
                    let children = self.parse_query_content(&Token::BraceClose)?;
                    self.consume();
                    Ok(Query::named_with_children(key, children))
                }
                _ => Ok(Query::named_empty(key)),
            },
            (unexpected_token, span) => {
                // TODO: decouple this. maybe this should be in another method that based that
                // a Query and a previous_token, it returns the possible previous_tokens
                // The fact that this non-terminal knows about the previous_token is a bit
                // weird and coupled.
                // IDEA: have an enum from all non-terminals and have a method that returns
                // the possible previous_tokens for each non-terminal

                // Maybe this is useless. For example, see
                // ```
                // {hola(
                // ```
                let expected_tokens = match &self.previous_token {
                    Some((Token::Key(_), _)) => ExpectedTokens(vec![
                        OwnedToken::BraceOpen,
                        // TODO: expect a key, or expect epsilon here? we were biased
                        // because we know that it would be a list of keys
                        OwnedToken::Key("key".to_string()),
                    ]),
                    _ => ExpectedTokens(vec![OwnedToken::Key("key".to_string())]),
                };
                Err(ParserError::UnexpectedToken {
                    expected: expected_tokens,
                    found: unexpected_token.into(),
                    span,
                })
            }
        }
    }
}
