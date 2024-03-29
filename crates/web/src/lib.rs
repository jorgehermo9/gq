use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn test(name: &str) -> String {
    format!("Hello, {name}!")
}
