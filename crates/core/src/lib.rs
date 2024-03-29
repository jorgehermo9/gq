use parser::Parser;
use query::Query;
use serde_json::Value;
use thiserror::Error;

pub mod lexer;
pub mod parser;
pub mod query;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Parser error: {0}")]
    Parser(#[from] parser::Error),
    #[error("Error while deserializing json: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("Query error: {0}")]
    Query(#[from] query::Error),
}

// TODO: be more generic over the input. Maybe someone wants to call this with an already
// constructed Value, (for example, a web server) and we should not force them to
// serialize it to a string and then parse it again.
pub fn entrypoint(query: &str, json: &str) -> Result<String, Error> {
    let query = Parser::new(query).parse()?;
    let json: Value = serde_json::from_str(json)?;
    let query_result = query.apply(json)?;
    Ok(query_result.to_string())
}
