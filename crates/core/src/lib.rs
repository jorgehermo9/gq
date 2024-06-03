use thiserror::Error;

pub mod data;
pub mod format;
// TODO: split lexer and parser into its own crate? so core is just the logic
// around a constructed query
pub mod lexer;
pub mod parser;
pub mod query;
