use gq_core::{
    format::{Indentation, PrettyFormat},
    query::Query,
};
use serde_json::Value;
use wasm_bindgen::prelude::*;

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
    Ok(query.pretty_format(&indentation, false)?)
}

fn pretty_format_json(value: &Value, indent: usize) -> Result<String, JsError> {
    let indentation = Indentation::with_spaces(indent);
    Ok(value.pretty_format(&indentation, false)?)
}
