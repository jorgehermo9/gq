use std::{error::Error, sync::Arc};

use cached::proc_macro::cached;
use completions::CompletionItem;
use gq_core::data::{self, Data};
use patch::{PatchedQuery, PatchedRawQuery};
use serde_json::Value;
pub mod completions;
pub mod patch;

// TODO: can we do this without cloning the data? I dont know if this is
// the best way to cache...
#[cached(size = 1)]
fn get_value_cached(data: OwnedData) -> Result<Value, Arc<data::Error>> {
    Value::try_from(&data.0).map_err(Arc::new)
}

#[derive(Debug, Clone, Hash, PartialEq, Eq)]
struct OwnedData(Data<'static>);

impl From<Data<'_>> for OwnedData {
    fn from(data: Data) -> Self {
        OwnedData(data.into_owned())
    }
}

fn do_get_completions(
    query: &str,
    position: usize,
    data: Data,
) -> Result<Vec<CompletionItem>, Box<dyn Error>> {
    let patched_raw_query = PatchedRawQuery::new(query, position);
    let patched_query = PatchedQuery::try_from(&patched_raw_query)?;

    let compacted_query = patched_query.compact();
    // TODO: this if this method is faster with the cached value...
    let value = get_value_cached(data.into())?;
    // let value = Value::try_from(&data)?;

    let result = compacted_query.apply(value)?;

    Ok(completions::get_value_completions(&result))
}
pub fn get_completions(query: &str, position: usize, data: Data) -> Vec<CompletionItem> {
    do_get_completions(query, position, data)
        .map_err(|e| log::debug!("Error while computing completions: {e}"))
        .unwrap_or_default()
}
