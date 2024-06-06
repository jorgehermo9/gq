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
        .collect::<BTreeSet<_>>()
        .into_iter()
        .map(CompletionItem::new)
        .collect()
}

// TODO: check if it is too overhead to return a trait object iterator. Maybe we can use
// Either or something like that.
fn get_keys(value: &Value) -> Box<dyn Iterator<Item = String> + '_> {
    match value {
        Value::Object(map) => Box::new(map.keys().map(ToString::to_string)),
        Value::Array(array) => Box::new(array.iter().flat_map(get_keys)),
        _ => Box::new(std::iter::empty()),
    }
}
