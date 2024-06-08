use std::collections::BTreeSet;

use derive_getters::Getters;
use gq_core::query::query_arguments::ValueType;
use serde_json::Value;

#[derive(Debug, Clone, Getters, Eq, PartialEq, Ord, PartialOrd)]
pub struct CompletionItem {
    completion: String,
    detail: Option<String>,
}

impl CompletionItem {
    pub fn new(completion: String, detail: Option<String>) -> Self {
        Self { completion, detail }
    }
}

//TODO: improve naming
// TODO: fix bug,right now, keys with different detail (types) are considered different, so they
// are not deduplicated. For example, an array of two objects, one with a key "a" of type
// string and another with a key "a" of type number, will return two completions for "a".
pub fn get_value_completions(value: &Value) -> Vec<CompletionItem> {
    do_get_value_completions(value)
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect()
}

// TODO: check if it is too overhead to return a trait object iterator. Maybe we can use
// Either or something like that.
fn do_get_value_completions(value: &Value) -> Box<dyn Iterator<Item = CompletionItem> + '_> {
    match value {
        Value::Object(map) => Box::new(map.iter().map(From::from)),
        Value::Array(array) => Box::new(array.iter().flat_map(do_get_value_completions)),
        _ => Box::new(std::iter::empty()),
    }
}

impl From<(&String, &Value)> for CompletionItem {
    fn from((key, value): (&String, &Value)) -> Self {
        let detail = format!("({})", value.value_type());
        Self::new(key.to_string(), Some(detail))
    }
}
