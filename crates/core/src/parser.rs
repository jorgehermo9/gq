use crate::lexer::{self, Token};
use crate::query::query_arguments::{
    QueryArgument, QueryArgumentOperation, QueryArgumentValue, QueryArguments,
};
use crate::query::query_key::{AtomicQueryKey, QueryKey, RawKey};
use crate::query::{ChildQuery, ChildQueryBuilder, Query, QueryBuilder};
use logos::{Logos, Span, SpannedIter};
use regex::Regex;
use std::iter::Peekable;
use std::str::FromStr;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;
type SpannedToken = (Token, Span);
type SpannedTokenRef<'a> = (&'a Token, Span);

#[derive(Error, Debug)]
pub enum Error {
    // TODO: Group parser errors inside a ParserError enum?
    #[error("Unexpected token '{0}'")]
    UnexpectedToken(Token, Span),
    #[error("Unexpected end of input")]
    UnexpectedEndOfInput(Span),
    #[error("Unexpected token after root query")]
    UnexpectedTokenAfterRootQuery(Span),
    #[error("Lexer Error: {0}")]
    Lexer(lexer::Error, Span),
    #[error("Query construction error: {0}")]
    Construction(crate::query::Error, Span),
    #[error("Regex parsing error: {0}")]
    Regex(regex::Error, Span),
}

impl Error {
    pub fn span(&self) -> &Span {
        match self {
            Self::UnexpectedToken(_, span) => span,
            Self::UnexpectedEndOfInput(span) => span,
            Self::UnexpectedTokenAfterRootQuery(span) => span,
            Self::Lexer(_, span) => span,
            Self::Construction(_, span) => span,
            Self::Regex(_, span) => span,
        }
    }
}

pub struct Parser<'src> {
    lexer: Peekable<SpannedIter<'src, Token>>,
    source: &'src str,
}

impl<'src> Parser<'src> {
    pub fn new(source: &'src str) -> Self {
        Self {
            lexer: Token::lexer(source).spanned().peekable(),
            source,
        }
    }

    pub fn parse(&mut self) -> Result<Query> {
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
        self.peek().map(|(_, span)| span)
    }

    fn span_between(start: Span, end: Span) -> Span {
        start.start..end.end
    }

    fn peek(&mut self) -> Result<SpannedTokenRef<'_>> {
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

    fn consume(&mut self) -> Result<Span> {
        self.next_token().map(|(_, span)| span)
    }

    fn next_token(&mut self) -> Result<SpannedToken> {
        let spanned_token = self
            .lexer
            .next()
            // TODO: return this error or just output the EOF token as the peek fn does?
            .ok_or_else(|| Error::UnexpectedEndOfInput(self.last_span()))?;

        let (token, span) = spanned_token;
        let token = token.map_err(|err| Error::Lexer(err, span.clone()))?;
        Ok((token, span))
    }

    /// # Grammar
    /// `S -> QUERY_ARGUMENTS ROOT_QUERY_KEY | QUERY_ARGUMENTS ROOT_QUERY_KEY { QUERY_CONTENT }`
    fn parse_root_query(&mut self) -> Result<Query> {
        let root_span_start = self.current_span()?;
        let arguments = self.parse_query_arguments()?;
        let root_query_key = self.parse_root_query_key()?;

        match self.peek()? {
            (Token::LBrace, _) => {
                self.consume()?;
                let children = self.parse_query_content(&Token::RBrace)?;
                let root_span_end = self.consume()?;
                let root_span = Self::span_between(root_span_start, root_span_end);

                QueryBuilder::default()
                    .arguments(arguments)
                    .children(children)
                    .key(root_query_key)
                    .build()
                    .map_err(|err| Error::Construction(err.into(), root_span))
            }
            (_, root_span_end) => {
                let root_span = Self::span_between(root_span_start, root_span_end);
                QueryBuilder::default()
                    .arguments(arguments)
                    .key(root_query_key)
                    .build()
                    .map_err(|err| Error::Construction(err.into(), root_span))
            }
        }
    }

    /// # Grammar
    /// `QUERY_CONTENT -> QUERY QUERY_CONTENT | ε`
    fn parse_query_content(&mut self, stop_token: &Token) -> Result<Vec<ChildQuery>> {
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
    /// `QUERY -> QUERY_KEY QUERY_ALIAS | QUERY_KEY QUERY_ALIAS { QUERY_CONTENT }
    fn parse_query(&mut self) -> Result<ChildQuery> {
        let query_span_start = self.current_span()?;
        let query_key = self.parse_query_key()?;
        let query_alias = self.parse_query_alias()?;

        match self.peek()? {
            (Token::LBrace, _) => {
                self.consume()?;
                let children = self.parse_query_content(&Token::RBrace)?;
                let query_span_end = self.consume()?;
                let query_span = Self::span_between(query_span_start, query_span_end);

                ChildQueryBuilder::default()
                    .key(query_key)
                    .alias(query_alias)
                    .children(children)
                    .build()
                    .map_err(|err| Error::Construction(err.into(), query_span))
            }
            (_, query_span_end) => {
                let query_span = Self::span_between(query_span_start, query_span_end);
                ChildQueryBuilder::default()
                    .key(query_key)
                    .alias(query_alias)
                    .build()
                    // TODO: We should take the end span from the query alias function
                    .map_err(|err| Error::Construction(err.into(), query_span))
            }
        }
    }

    /// # Grammar
    /// `ROOT_QUERY_KEY -> QUERY_KEY | ε`
    fn parse_root_query_key(&mut self) -> Result<QueryKey> {
        match self.peek()? {
            // We have to know what comes next due to the epsilon rule
            (Token::Identifier(_), _) | (Token::String(_), _) => self.parse_query_key(),
            _ => Ok(Default::default()),
        }
    }

    /// # Grammar
    /// `QUERY_KEY -> ATOMIC_QUERY_KEY . QUERY_KEY | ATOMIC_QUERY_KEY`
    fn parse_query_key(&mut self) -> Result<QueryKey> {
        let mut keys = Vec::new();
        loop {
            let atomic_query_key = self.parse_atomic_query_key()?;
            keys.push(atomic_query_key);
            match self.peek()? {
                (Token::Dot, _) => {
                    self.consume()?;
                }
                _ => return Ok(QueryKey::new(keys)),
            }
        }
    }

    /// # Grammar
    /// `ATOMIC_QUERY_KEY -> RAW_KEY QUERY_ARGUMENTS`
    fn parse_atomic_query_key(&mut self) -> Result<AtomicQueryKey> {
        let raw_key = self.parse_raw_key()?;
        let arguments = self.parse_query_arguments()?;
        Ok(AtomicQueryKey::new(raw_key, arguments))
    }

    /// # Grammar
    /// `RAW_KEY -> key | string`
    fn parse_raw_key(&mut self) -> Result<RawKey> {
        match self.next_token()? {
            (Token::Identifier(key), _) => Ok(RawKey::Identifier(key)),
            (Token::String(key), _) => Ok(RawKey::String(key)),
            (unexpected_token, span) => Err(Error::UnexpectedToken(unexpected_token, span)),
        }
    }

    /// # Grammar
    /// `QUERY_ALIAS -> : RAW_KEY | ε`
    fn parse_query_alias(&mut self) -> Result<Option<RawKey>> {
        match self.peek()? {
            (Token::Colon, _) => {
                self.consume()?;
                self.parse_raw_key().map(Some)
            }
            _ => Ok(None),
        }
    }

    /// # Grammar
    /// `QUERY_ARGUMENTS -> ( QUERY_ARGUMENTS_CONTENT ) | ε`
    fn parse_query_arguments(&mut self) -> Result<QueryArguments> {
        match self.peek()? {
            (Token::LParen, _) => {
                self.consume()?;
                let arguments = QueryArguments::new(self.parse_query_arguments_content()?);
                match self.next_token()? {
                    (Token::RParen, _) => Ok(arguments),
                    (unexpected_token, span) => Err(Error::UnexpectedToken(unexpected_token, span)),
                }
            }
            _ => Ok(Default::default()),
        }
    }

    /// # Grammar
    /// `QUERY_ARGUMENTS_CONTENT -> QUERY_ARGUMENT , QUERY_ARGUMENTS_CONTENT | QUERY_ARGUMENT`
    fn parse_query_arguments_content(&mut self) -> Result<Vec<QueryArgument>> {
        let mut arguments = Vec::new();

        loop {
            let argument = self.parse_query_argument()?;
            arguments.push(argument);

            match self.peek()? {
                (Token::Comma, _) => {
                    self.consume()?;
                }
                _ => return Ok(arguments),
            }
        }
    }

    /// # Grammar
    /// `QUERY_ARGUMENT -> QUERY_KEY QUERY_AGUMENT_OPERATION`
    fn parse_query_argument(&mut self) -> Result<QueryArgument> {
        let key = self.parse_query_key()?;
        let operation = self.parse_query_argument_operation()?;
        Ok(QueryArgument::new(key, operation))
    }

    /// # Grammar
    /// `QUERY_AGUMENT_OPERATION -> = QUERY_ARGUMENT_VALUE | != QUERY_ARGUMENT_VALUE
    ///     | > NUMBER | >= NUMBER
    ///     | < NUMBER | <= NUMBER
    ///     | ~ REGEX | !~ REGEX`
    fn parse_query_argument_operation(&mut self) -> Result<QueryArgumentOperation> {
        match self.next_token()? {
            (Token::Equal, _) => Ok(QueryArgumentOperation::Equal(
                self.parse_query_argument_value()?,
            )),
            (Token::NotEqual, _) => Ok(QueryArgumentOperation::NotEqual(
                self.parse_query_argument_value()?,
            )),
            (Token::Greater, _) => Ok(QueryArgumentOperation::Greater(self.parse_number()?)),
            (Token::GreaterEqual, _) => {
                Ok(QueryArgumentOperation::GreaterEqual(self.parse_number()?))
            }
            (Token::Less, _) => Ok(QueryArgumentOperation::Less(self.parse_number()?)),
            (Token::LessEqual, _) => Ok(QueryArgumentOperation::LessEqual(self.parse_number()?)),
            (Token::Tilde, _) => Ok(QueryArgumentOperation::Match(self.parse_regex()?)),
            (Token::NotTilde, _) => Ok(QueryArgumentOperation::NotMatch(self.parse_regex()?)),
            (unexpected_token, span) => Err(Error::UnexpectedToken(unexpected_token, span)),
        }
    }

    /// # Grammar
    /// `QUERY_ARGUMENT_VALUE -> string | number | boolean | null`
    fn parse_query_argument_value(&mut self) -> Result<QueryArgumentValue> {
        match self.next_token()? {
            (Token::String(value), _) => Ok(QueryArgumentValue::String(value)),
            (Token::Number(value), _) => Ok(QueryArgumentValue::Number(value)),
            (Token::Bool(value), _) => Ok(QueryArgumentValue::Bool(value)),
            (Token::Null, _) => Ok(QueryArgumentValue::Null),
            (unexpected_token, span) => Err(Error::UnexpectedToken(unexpected_token, span)),
        }
    }
    /// # Grammar
    /// `NUMBER -> number`
    fn parse_number(&mut self) -> Result<f64> {
        match self.next_token()? {
            (Token::Number(value), _) => Ok(value),
            (unexpected_token, span) => Err(Error::UnexpectedToken(unexpected_token, span)),
        }
    }

    /// # Grammar
    /// `REGEX -> regex`
    fn parse_regex(&mut self) -> Result<Regex> {
        match self.next_token()? {
            (Token::String(value), span) => {
                Regex::new(&value).map_err(|err| Error::Regex(err, span))
            }
            (unexpected_token, span) => Err(Error::UnexpectedToken(unexpected_token, span)),
        }
    }
}

impl FromStr for Query {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self> {
        Parser::new(s).parse()
    }
}
