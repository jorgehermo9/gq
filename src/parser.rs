use logos::{Logos, Span, SpannedIter};
use std::iter::Peekable;
use thiserror::Error;

use crate::lexer::{LexerError, Token};
use crate::query::Query;

type ParserResult<T> = Result<T, ParserError>;
type SpannedToken<'src> = (Token<'src>, Span);
type SpannedTokenRef<'a, 'src> = (&'a Token<'src>, Span);

#[derive(Error, Debug)]
pub enum ParserError {
    #[error("Unexpected token")]
    // TODO: be generic over this, specify which token is the unexpected
    // and which token could be valid in a vector, with better string such as
    // Unexpected token '{', expecting '}' or 'key'
    UnexpectedToken(Span),
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
            Self::UnexpectedToken(span) => span,
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
    source: &'src str,
}

impl<'src> Parser<'src> {
    pub fn new(source: &'src str) -> Self {
        Self {
            lexer: Token::lexer(source).spanned().peekable(),
            source,
        }
    }

    pub fn last_span(&self) -> Span {
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
        let spanned_token = self
            .lexer
            .next()
            .ok_or_else(|| ParserError::UnexpectedEndOfInput(self.last_span()))?;

        let (token, span) = spanned_token;
        let token = token.map_err(|err| ParserError::Lexer(err, span.clone()))?;
        Ok((token, span))
    }

    pub fn parse(&mut self) -> ParserResult<Query<'src>> {
        let query = self.parse_root_query()?;

        if self.lexer.next().is_some() {
            return Err(ParserError::UnexpectedTokenAfterRootQuery(self.last_span()));
        }

        Ok(query)
    }

    fn parse_root_query(&mut self) -> ParserResult<Query<'src>> {
        match self.next_token()? {
            (Token::BraceOpen, _) => {
                let children = self.parse_query_content()?;
                match self.next_token()? {
                    (Token::BraceClose, _) => Ok(Query::root_with_children(children)),
                    (_, span) => Err(ParserError::ExpectedClosingBrace(span)),
                }
            }
            (Token::Key(_), _) => todo!(),
            (_, span) => Err(ParserError::ExpectedOpeningBraceOrKey(span)),
        }
    }

    fn parse_query(&mut self) -> ParserResult<Query<'src>> {
        match self.next_token()? {
            (Token::Key(key), _) => match self.peek()? {
                (Token::BraceOpen, _) => {
                    self.consume();
                    let children = self.parse_query_content()?;
                    match self.next_token()? {
                        (Token::BraceClose, _) => Ok(Query::named_with_children(key, children)),
                        (_, span) => Err(ParserError::ExpectedClosingBrace(span)),
                    }
                }
                _ => Ok(Query::named_empty(key)),
            },
            //TODO: improve unexpectedToken
            (_, span) => Err(ParserError::UnexpectedToken(span)),
        }
    }

    fn parse_query_content(&mut self) -> ParserResult<Vec<Query<'src>>> {
        let mut queries = Vec::new();

        loop {
            match self.peek()? {
                (Token::BraceClose, _) => return Ok(queries),
                (Token::Key(_), _) => {
                    let query = self.parse_query()?;
                    queries.push(query);
                }
                // TODO: improve unexpectedToken, show which token appears
                (_, span) => return Err(ParserError::UnexpectedToken(span)),
            }
        }
    }
}
