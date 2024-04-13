use gq_core::query::RootQuery;
use serde::Serialize;
use serde_json::{ser::PrettyFormatter, Serializer, Value};
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
    let query = RootQuery::try_from(query)?;
    Ok(query.pretty_format(indent))
}

fn pretty_format_json(value: &Value, indent: usize) -> Result<String, JsError> {
    if indent == 0 {
        return Ok(value.to_string());
    }
    let mut buf = Vec::new();
    let indent = " ".repeat(indent);
    let formatter = PrettyFormatter::with_indent(indent.as_bytes());
    let mut serializer = Serializer::with_formatter(&mut buf, formatter);
    value.serialize(&mut serializer)?;
    Ok(String::from_utf8(buf)?)
}
