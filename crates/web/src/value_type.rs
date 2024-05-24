use gq_core::value_type::ValueType;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub enum JsValueType {
    Json,
    Yaml,
}

impl From<JsValueType> for ValueType {
    fn from(js_value_type: JsValueType) -> Self {
        match js_value_type {
            JsValueType::Json => ValueType::Json,
            JsValueType::Yaml => ValueType::Yaml,
        }
    }
}
