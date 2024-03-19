use logos::{Lexer, Logos, Span};

use crate::lexer::Token;
use crate::query::Query;
pub struct Parser<'src> {
    lexer: Lexer<'src, Token<'src>>,
}

type Error = (String, Span);
type Result<T> = std::result::Result<T, Error>;

impl<'src> Parser<'src> {
    pub fn new(source: &'src str) -> Self {
        Self {
            lexer: Token::lexer(source),
        }
    }

    pub fn parse(&mut self) -> Result<Query<'src>> {
        let query = self.parse_root_query()?;

        if self.lexer.next().is_some() {
            return Err(("Unexpected token".to_string(), self.lexer.span()));
        }

        Ok(query)
    }

    fn next_token(&mut self) -> Result<Token<'src>> {
        let Some(token) = self.lexer.next() else {
            return Err(("Unexpected end of input".to_string(), self.lexer.span()));
        };

        let Ok(token) = token else {
            return Err(("Unknown token".to_string(), self.lexer.span()));
        };
        Ok(token)
    }

    fn parse_root_query(&mut self) -> Result<Query<'src>> {
        let token = self.next_token()?;
        match token {
            Token::BraceOpen => {
                let children = self.parse_query()?;
                Ok(Query::root_with_children(children))
            }
            Token::Key(key) => Ok(Query::named_empty(key)),
            _ => Err((
                "Expected opening brace or key".to_string(),
                self.lexer.span(),
            )),
        }
    }

    fn parse_query(&mut self) -> Result<Vec<Query<'src>>> {
        let mut queries = Vec::new();

        loop {
            let token = self.next_token()?;
            match token {
                Token::BraceClose => {
                    return Ok(queries);
                }
                Token::Key(key) => match self.next_token()? {
                    Token::Comma => {
                        let query = Query::named_empty(key);
                        queries.push(query);
                    }
                    Token::BraceOpen => {
                        let children = self.parse_query()?;
                        let query = Query::named_with_children(key, children);
                        queries.push(query);
                    }
                    Token::BraceClose => {
                        let query = Query::named_empty(key);
                        queries.push(query);
                        return Ok(queries);
                    }
                    _ => {
                        return Err((
                            "unexpected token here, expecting ',', '{' or '}'".to_owned(),
                            self.lexer.span(),
                        ))
                    }
                },
                _ => {
                    return Err((
                        "Expected closing brace or key".to_string(),
                        self.lexer.span(),
                    ))
                }
            }
        }
    }
}
