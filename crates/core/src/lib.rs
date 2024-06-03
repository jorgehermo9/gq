use lsp::completion_item::{CompletionItem, CompletionItemBuilder};
use rowan::{TextRange, TextSize};
use thiserror::Error;

pub mod data;
pub mod format;
// TODO: split lexer and parser into its own crate? so core is just the logic
// around a constructed query
pub mod lexer;
// TODO: split lsp into its own module?st

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
