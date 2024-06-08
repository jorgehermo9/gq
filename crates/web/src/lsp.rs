use gq_lsp::completions::CompletionItem;
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
            detail: completion_item.detail().as_ref().map(ToString::to_string),
            documentation: None,
        }
    }
}
