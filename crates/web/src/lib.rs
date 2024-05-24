use gq_core::format::{Indentation, PrettyFormat};
use gq_core::query::Query;
use lsp::JsCompletionItem;
use serde_json::Value;
use wasm_bindgen::prelude::*;

mod lsp;

#[wasm_bindgen]
pub fn gq(query: &str, json: &str, indent: usize) -> Result<String, JsError> {
    let result = gq_core::entrypoint(query, json)?;
    pretty_format_json(&result, indent)
}

#[wasm_bindgen]
pub fn format_json(json: &str, indent: usize) -> Result<String, JsError> {
    let value: Value = serde_json::from_str(json)?;
    pretty_format_json(&value, indent)
}

#[wasm_bindgen]
pub fn format_query(query: &str, indent: usize) -> Result<String, JsError> {
    let query = Query::try_from(query)?;
    let indentation = Indentation::with_spaces(indent);
    Ok(query.pretty_format(&indentation)?)
}

#[wasm_bindgen]
pub fn convert_to_yaml(json: &str) -> Result<String, JsError> {
    let value: Value = serde_json::from_str(json)?;
    Ok(serde_yaml::to_string(&value)?)
}

#[wasm_bindgen]
pub fn convert_to_json(yaml: &str) -> Result<String, JsError> {
    let value: Value = serde_yaml::from_str(yaml)?;
    Ok(serde_json::to_string(&value)?)
}

#[wasm_bindgen]
pub fn completions(query: &str, position: u32, trigger: char) -> Vec<JsCompletionItem> {
    gq_core::completions(query, position, trigger)
        .into_iter()
        .map(JsCompletionItem::new)
        .collect()
}

fn pretty_format_json(value: &Value, indent: usize) -> Result<String, JsError> {
    let indentation = Indentation::with_spaces(indent);
    Ok(value.pretty_format(&indentation)?)
}
