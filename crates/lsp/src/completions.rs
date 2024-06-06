use std::collections::{BTreeSet, HashSet};

use derive_getters::Getters;
use serde_json::Value;

#[derive(Debug, Clone, Getters)]
pub struct CompletionItem {
    completion: String,
}

impl CompletionItem {
    pub fn new(completion: String) -> Self {
        Self { completion }
    }
}

//TODO: improve naming
pub fn get_value_completions(value: &Value) -> Vec<CompletionItem> {
    get_keys(value)
        .into_iter()
        .map(CompletionItem::new)
        .collect()
}

fn get_keys(value: &Value) -> BTreeSet<String> {
    match value {
        Value::Object(map) => map.keys().map(ToString::to_string).collect(),
        Value::Array(array) => array.iter().flat_map(get_keys).collect(),
        _ => Default::default(),
    }
}
