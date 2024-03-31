use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn gq(query: &str, json: &str) -> String {
    match gq_core::entrypoint(query, json) {
        Ok(result) => serde_json::to_string_pretty(&result).expect("Failed to serialize result"),
        Err(e) => e.to_string(),
    }
}
