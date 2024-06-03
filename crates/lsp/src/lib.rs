use completion_item::CompletionItem;
use gq_core::query::Query;

pub mod completion_item;
pub mod patch;

pub fn completions(query: &str, position: usize, trigger: char) -> Vec<CompletionItem> {
    let patched_query = patch::patch_completion_query(query, position);

    dbg!(&patched_query);

    let query = Query::try_from(patched_query.as_str()).unwrap();

    dbg!(&query);

    dbg!(patch::compact_query(query));

    (0..10)
        .map(|i| CompletionItem::new(format!("item_{i}")))
        .collect()
}
