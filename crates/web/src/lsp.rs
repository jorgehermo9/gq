use gq_lsp::completion_item::CompletionItem;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct JsCompletionItem {
    pub label: String,
    pub completion: String,
    pub detail: Option<String>,
    pub documentation: Option<String>,
}

impl From<CompletionItem> for JsCompletionItem {
    fn from(completion_item: CompletionItem) -> Self {
        Self {
            label: completion_item.completion().to_string(),
            completion: completion_item.completion().to_string(),
            detail: None,
            documentation: None,
        }
    }
}
