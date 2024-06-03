use gq_core::query::{ChildQuery, Query, QueryBuilder, QueryKey};
use once_cell::sync::Lazy;
use uuid;

static PATCH_IDENTIFIER: Lazy<String> = Lazy::new(|| {
    let id = uuid::Uuid::new_v4().to_string();
    format!("GQ_COMPLETION_PATCH_{id}")
});
pub fn patch_completion_query(query: &str, position: usize) -> String {
    let mut query = query.to_string();
    query.insert_str(position, PATCH_IDENTIFIER.as_str());

    query
}

pub fn compact_query(query: Query) -> Query {
    let patch_identifier_position = query
        .key()
        .keys()
        .iter()
        .position(|key| key.key().0.contains(PATCH_IDENTIFIER.as_str()));

    if let Some(position) = patch_identifier_position {
        let target_keys = query.key().keys().iter().take(position).cloned();
        let new_query_key = QueryKey::new(target_keys.collect());

        return QueryBuilder::default().key(new_query_key).build().unwrap();
    }

    let compacted_children = query.children.into_iter().flat_map(compact_child).next();

    let new_root_query_key = match compacted_children {
        Some(child) => query.key + child,
        None => query.key,
    };

    QueryBuilder::default()
        .key(new_root_query_key)
        .build()
        .unwrap()
}

fn compact_child(query: ChildQuery) -> Option<QueryKey> {
    let patch_identifier_position = query
        .key()
        .keys()
        .iter()
        .position(|key| key.key().0.contains(PATCH_IDENTIFIER.as_str()));

    dbg!(&patch_identifier_position);
    match patch_identifier_position {
        Some(position) => {
            // Do not include the patch identifier in the new query key
            let target_keys = query.key().keys().iter().take(position).cloned();
            let new_query_key = QueryKey::new(target_keys.collect());
            dbg!("found");
            Some(new_query_key)
        }
        None => {
            let compacted_children = query.children.into_iter().flat_map(compact_child).next();

            match compacted_children {
                Some(child) => Some(query.key + child),
                None => None,
            }
        }
    }
}
