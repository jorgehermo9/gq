use data_type::JsDataType;
use gq_core::data_type::DataType;
use gq_core::format::{Indentation, PrettyFormat};
use gq_core::query::Query;
use lsp::JsCompletionItem;
use serde_json::Value;
use wasm_bindgen::prelude::*;

pub mod data_type;
pub mod lsp;

#[wasm_bindgen]
pub fn gq(
    query: &str,
    data: &str,
    input_type: JsDataType,
    output_type: JsDataType,
    indent: usize,
) -> Result<String, JsError> {
    let query = Query::try_from(query)?;
    let value = DataType::from(input_type).value_from_str(data)?;
    let result = query.apply(value)?;

    let indentation = Indentation::with_spaces(indent);
    let output_type = DataType::from(output_type);
    Ok(output_type.pretty_format(&result, &indentation)?)
}

#[wasm_bindgen]
pub fn format_data(data: &str, data_type: JsDataType, indent: usize) -> Result<String, JsError> {
    let data_type = DataType::from(data_type);
    let value = data_type.value_from_str(data)?;
    let indentation = Indentation::with_spaces(indent);
    Ok(data_type.pretty_format(&value, &indentation)?)
}

#[wasm_bindgen]
pub fn format_query(query: &str, indent: usize) -> Result<String, JsError> {
    let query = Query::try_from(query)?;
    let indentation = Indentation::with_spaces(indent);
    Ok(query.pretty_format(&indentation)?)
}

#[wasm_bindgen]
pub fn pretty_convert_to(
    data: &str,
    input_type: JsDataType,
    output_type: JsDataType,
    indent: usize,
) -> Result<String, JsError> {
    let input_type = DataType::from(input_type);
    let output_type = DataType::from(output_type);
    let indentation = Indentation::with_spaces(indent);

    // TODO: should we pretty format here? In the frontend we will call to pretty format after this
    Ok(input_type.pretty_convert_to(data, &output_type, &indentation)?)
}

#[wasm_bindgen]
pub fn completions(query: &str, position: u32, trigger: char) -> Vec<JsCompletionItem> {
    gq_core::completions(query, position, trigger)
        .into_iter()
        .map(JsCompletionItem::new)
        .collect()
}
