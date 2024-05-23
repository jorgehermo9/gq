use lsp::completion_item::{CompletionItem, CompletionItemBuilder};
use query::Query;
use rowan::{TextRange, TextSize};
use serde_json::Value;
use thiserror::Error;

pub mod lexer;
pub mod lsp;
pub mod parser;
pub mod query;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Error while parsing query: {0}")]
    Parser(#[from] parser::Error),
    #[error("Error while deserializing json: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("Error while applying query: {0}")]
    ApplyQuery(#[from] query::apply::Error),
}

// TODO: be more generic over the input. Maybe someone wants to call this with an already
// constructed Value, (for example, a web server) and we should not force them to
// serialize it to a string and then parse it again.
pub fn entrypoint(query: &str, json: &str) -> Result<Value, Error> {
    let query = Query::try_from(query)?;
    let json: Value = serde_json::from_str(json)?;
    let query_result = query.apply(json)?;
    Ok(query_result)
}

pub fn completions(query: &str, position: u32, trigger: char) -> Vec<CompletionItem> {
    let item = CompletionItemBuilder::default()
        .source_range(TextRange::new(
            TextSize::new(position),
            TextSize::new(position),
        ))
        .completion("Test".to_string())
        .label("another_item".to_string())
        .detail("Hello World".to_string())
        .documentation("Hello World".to_string())
        .build()
        .unwrap();
    let another_item = CompletionItemBuilder::default()
        .source_range(TextRange::new(
            TextSize::new(position),
            TextSize::new(position),
        ))
        .completion("Test".to_string())
        .label("item".to_string())
        .detail("Hello World".to_string())
        .documentation("Hello World".to_string())
        .build()
        .unwrap();
    vec![item, another_item]
}
