use std::error::Error;

use completions::CompletionItem;
use gq_core::data::Data;
use patch::{PatchedQuery, PatchedRawQuery};
use serde_json::Value;

pub mod completions;
pub mod patch;

fn inner_completions(
    query: &str,
    position: usize,
    trigger: char,
    // TODO: receive &str or &Value
    data: &Data,
) -> Result<Vec<CompletionItem>, Box<dyn Error>> {
    let patched_raw_query = PatchedRawQuery::new(query, position);
    let patched_query = PatchedQuery::try_from(&patched_raw_query)?;

    let compacted_query = patched_query.compact();
    let value = Value::try_from(data)?;

    let result = compacted_query.apply(value)?;

    Ok(completions::get_value_completions(&result))
}
pub fn get_completions(
    query: &str,
    position: usize,
    trigger: char,
    data: &Data,
) -> Vec<CompletionItem> {
    inner_completions(query, position, trigger, data)
        .map_err(|e| log::debug!("Error while computing completions: {e}"))
        .unwrap_or_default()
}
