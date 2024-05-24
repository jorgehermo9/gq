use gq_core::data_type::DataType;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub enum JsDataType {
    Json,
    Yaml,
}

impl From<JsDataType> for DataType {
    fn from(js_data_type: JsDataType) -> Self {
        match js_data_type {
            JsDataType::Json => DataType::Json,
            JsDataType::Yaml => DataType::Yaml,
        }
    }
}
