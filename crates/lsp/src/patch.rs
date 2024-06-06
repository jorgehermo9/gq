use gq_core::{
    parser,
    query::{AtomicQueryKey, ChildQuery, Query, QueryBuilder, QueryKey, RawKey},
};
use once_cell::sync::Lazy;
use uuid;

pub struct PatchedRawQuery {
    query: String,
    patch_id: String,
}

impl PatchedRawQuery {
    pub fn new(query: &str, position: usize) -> Self {
        let id: String = uuid::Uuid::new_v4().to_string();
        let patch_id = format!("GQ_COMPLETION_PATCH_{id}");
        let mut query = query.to_string();

        query.insert_str(position, patch_id.as_str());

        PatchedRawQuery { query, patch_id }
    }
}

pub struct PatchedQuery<'a> {
    query: Query<'a>,
    patch_id: &'a str,
}

impl<'a> TryFrom<&'a PatchedRawQuery> for PatchedQuery<'a> {
    type Error = parser::Error;

    fn try_from(raw_query: &'a PatchedRawQuery) -> Result<Self, Self::Error> {
        Query::try_from(raw_query.query.as_str()).map(|query| PatchedQuery {
            query,
            patch_id: &raw_query.patch_id,
        })
    }
}

impl<'a> PatchedQuery<'a> {
    pub fn compact(self) -> Query<'a> {
        let PatchedQuery { query, patch_id } = self;

        let patch_identifier_position = query
            .key()
            .keys()
            .iter()
            .map(AtomicQueryKey::key)
            .map(|RawKey(key)| key)
            .position(|key| key.contains(patch_id));

        if let Some(position) = patch_identifier_position {
            let target_keys = query.key.keys.into_iter().take(position);
            let new_query_key = QueryKey::new(target_keys.collect());

            return QueryBuilder::default().key(new_query_key).build().unwrap();
        }

        // At this point, we know that the identifier is not in the query.keys(), so
        // we have to search for it in the children
        let compacted_children_key = query
            .children
            .into_iter()
            .flat_map(|child| Self::compact_child(child, patch_id))
            .next()
            .expect("At least one of query's children should contain the patch identifier");

        let new_query_key = query.key + compacted_children_key;

        QueryBuilder::default().key(new_query_key).build().unwrap()
    }
    fn compact_child(query: ChildQuery<'a>, patch_id: &'a str) -> Option<QueryKey<'a>> {
        let patch_identifier_position = query
            .key()
            .keys()
            .iter()
            .position(|key| key.key().0.contains(patch_id));

        if let Some(position) = patch_identifier_position {
            let target_keys = query.key().keys().iter().take(position).cloned();
            let new_query_key = QueryKey::new(target_keys.collect());
            return Some(new_query_key);
        }

        // The patch identifier may be in another child, so this could be None
        let maybe_compacted_children_key = query
            .children
            .into_iter()
            .flat_map(|child| Self::compact_child(child, patch_id))
            .next();

        maybe_compacted_children_key
            .map(|compacted_children_key| query.key + compacted_children_key)
    }
}
