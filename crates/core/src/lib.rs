use parser::Parser;
use serde_json::Value;
use thiserror::Error;

pub mod lexer;
pub mod parser;
pub mod query;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("Parser error: {0}")]
    Parser(#[from] parser::Error),
    #[error("Error while deserializing json: {0}")]
    Serde(#[from] serde_json::Error),
}

pub fn entrypoint<'a>(query: &str, json: &'a str) -> Result<&'a str, CoreError> {
    let query = Parser::new(query).parse()?;
    let json: Value = serde_json::from_str(json)?;
    dbg!(query);
    todo!()
}
