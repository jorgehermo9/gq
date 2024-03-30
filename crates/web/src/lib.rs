use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn gq(query: &str, json: &str) -> String {
    match gq_core::entrypoint(query, json) {
        Ok(result) => result,
        Err(_) => "Invalid GQ".to_string(),
    }
}
