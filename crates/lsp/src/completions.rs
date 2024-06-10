use std::collections::BTreeSet;

use derive_getters::Getters;
use gq_core::query::query_arguments::ValueType;
use itertools::Itertools;
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
    do_get_value_completions(value).collect()
}

fn do_get_value_completions(value: &Value) -> impl Iterator<Item = CompletionItem> {
    let value_keys = do_get_value_keys(value)
        .collect::<BTreeSet<_>>()
        .into_iter();

    value_keys
        .into_group_map_by(|value_key| value_key.key.clone()) // TODO: improve this cloning?
        .into_iter()
        .map(CompletionItem::from)
}

#[derive(Debug, Eq, PartialEq, Ord, PartialOrd)]
struct ValueKey {
    key: String,
    r#type: String,
}

impl ValueKey {
    fn new(key: String, r#type: String) -> Self {
        Self { key, r#type }
    }
}

// TODO: check if it is too overhead to return a trait object iterator. Maybe we can use
// Either or something like that.
fn do_get_value_keys(value: &Value) -> Box<dyn Iterator<Item = ValueKey> + '_> {
    match value {
        Value::Object(map) => Box::new(map.iter().map(From::from)),
        Value::Array(array) => Box::new(array.iter().flat_map(do_get_value_keys)),
        _ => Box::new(std::iter::empty()),
    }
}

impl From<(&String, &Value)> for ValueKey {
    fn from((key, value): (&String, &Value)) -> Self {
        Self::new(key.to_string(), value.value_type())
    }
}

impl<I> From<(String, I)> for CompletionItem
where
    I: IntoIterator<Item = ValueKey>,
{
    fn from((key, value_keys): (String, I)) -> Self {
        let types = value_keys
            .into_iter()
            .map(|value_key| value_key.r#type)
            .join(", ");
        let detail = format!("({types})");
        CompletionItem::new(key, Some(detail))
    }
}
