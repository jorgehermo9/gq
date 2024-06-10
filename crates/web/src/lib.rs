use data::JsDataType;
use gq_core::data::Data;
use gq_core::format::Indentation;
use gq_core::query::Query;
use lsp::JsCompletionItem;
use serde_json::Value;
use wasm_bindgen::prelude::*;

use crate::data::JsData;

pub mod data;
pub mod lsp;

#[wasm_bindgen]
pub fn gq(
    query: &str,
    data: JsData,
    output_type: JsDataType,
    indent: usize,
) -> Result<JsData, JsError> {
    let query = query.parse::<Query>()?;
    let core_data = Data::from(data);
    let value = Value::try_from(&core_data)?;
    let indentation = Indentation::with_spaces(indent);

    let result = query.apply(value)?;
    let output_data = Data::pretty_from_value(&result, output_type.into(), indentation)?;

    Ok(output_data.into())
}

#[wasm_bindgen]
pub fn format_data(data: JsData, indent: usize) -> Result<JsData, JsError> {
    let core_data = Data::from(data);
    let indentation = Indentation::with_spaces(indent);

    let pretty_data = core_data.pretty_format(indentation)?;
    Ok(pretty_data.into())
}

#[wasm_bindgen]
pub fn format_query(query: &str, indent: usize) -> Result<String, JsError> {
    let query = query.parse::<Query>()?;
    let indentation = Indentation::with_spaces(indent);
    Ok(query.pretty_format(indentation))
}

#[wasm_bindgen]
pub fn convert_data_to(
    data: JsData,
    output_type: JsDataType,
    indent: usize,
) -> Result<JsData, JsError> {
    let core_data = Data::from(data);
    let indentation = Indentation::with_spaces(indent);

    let converted_data = core_data.pretty_convert_to(output_type.into(), indentation)?;
    Ok(converted_data.into())
}

#[wasm_bindgen]
pub fn completions(
    query: &str,
    position: u32,
    trigger: char,
    data: JsData,
) -> Vec<JsCompletionItem> {
    // TODO: handle u32 to usize conversion.
    let core_data = Data::from(data);
    // TODO: use trigger char?
    gq_lsp::get_completions(query, position.try_into().unwrap(), core_data)
        .into_iter()
        .map(From::from)
        .collect()
}
