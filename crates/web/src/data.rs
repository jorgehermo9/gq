use gq_core::data::{Data, DataType};
use wasm_bindgen::prelude::wasm_bindgen;

// TODO: rename all the `JsData*` types into just `Data*`.
// and refer to core data as `core::Data`
#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
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

#[wasm_bindgen(getter_with_clone)]
#[derive(Debug)]
pub struct JsData {
    pub payload: String,
    pub data_type: JsDataType,
}

#[wasm_bindgen]
impl JsData {
    pub fn json(data: String) -> Self {
        Self {
            payload: data,
            data_type: JsDataType::Json,
        }
    }

    pub fn yaml(data: String) -> Self {
        Self {
            payload: data,
            data_type: JsDataType::Yaml,
        }
    }
}

impl From<JsData> for Data<'_> {
    fn from(js_data: JsData) -> Self {
        match js_data.data_type {
            JsDataType::Json => Data::json(js_data.payload.into()),
            JsDataType::Yaml => Data::yaml(js_data.payload.into()),
        }
    }
}

impl From<Data<'_>> for JsData {
    fn from(data: Data<'_>) -> Self {
        match data.data_type() {
            DataType::Json => JsData::json(data.into_inner().into_owned()),
            DataType::Yaml => JsData::yaml(data.into_inner().into_owned()),
        }
    }
}
