use gq_core::lsp::completion_item::CompletionItem;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct JsCompletionItem {
	pub label: String,
	pub completion: String,
	pub label_detail: Option<String>,
	pub from: u32,
	pub to: u32,
	pub detail: Option<String>,
	pub documentation: Option<String>,
}


impl JsCompletionItem {
	pub fn new(item: CompletionItem) -> Self {
		Self {
			label: item.label,
			completion: item.completion,
			label_detail: item.label_detail,
			from: item.source_range.start().into(),
			to: item.source_range.end().into(),
			detail: item.detail,
			documentation: item.documentation,
		}
	}
}

