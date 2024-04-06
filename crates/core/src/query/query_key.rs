use std::fmt::{self, Display, Formatter};

use derive_getters::Getters;
use derive_more::Constructor;
use serde_json::Value;

use super::{
    context::{Context, JsonPathEntry},
    error::InternalError,
};

#[derive(Debug, Clone, Constructor)]
pub struct AtomicQueryKey<'a>(pub &'a str);

impl Display for AtomicQueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        self.0.fmt(f)
    }
}

#[derive(Debug, Clone, Constructor, Getters)]
pub struct QueryKey<'a> {
    keys: Vec<AtomicQueryKey<'a>>,
}

impl Display for QueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let keys = self
            .keys()
            .iter()
            .map(ToString::to_string)
            .collect::<Vec<String>>()
            .join(".");
        write!(f, "{keys}")
    }
}

impl<'a> QueryKey<'a> {
    pub fn last_key(&self) -> &AtomicQueryKey<'a> {
        self.keys().last().expect("query key cannot be empty")
    }
}

impl<'a> QueryKey<'a> {
    pub fn inspect(
        &self,
        value: &Value,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        Self::do_inspect(value, &self.keys, context)
    }
    fn do_inspect(
        value: &Value,
        keys: &[AtomicQueryKey<'a>],
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        let Some((AtomicQueryKey(current_key), rest)) = keys.split_first() else {
            // TODO: try to return a reference here and clone in the caller, so this is more flexible for
            // callers that only needs a reference
            return Ok(value.clone());
        };
        let new_context = context.push_entry(JsonPathEntry::Key(current_key));

        match value {
            Value::Object(object) => {
                let current = object
                    .get(*current_key)
                    .ok_or(InternalError::KeyNotFound(new_context.path().clone()))?;
                Self::do_inspect(current, rest, &new_context)
            }
            Value::Array(array) => {
                let array_context = context.enter_array();
                let indexed_array = array
                    .iter()
                    .enumerate()
                    .map(|(index, item)| {
                        let item_context = array_context.push_entry(JsonPathEntry::Index(index));
                        Self::do_inspect(item, keys, &item_context)
                    })
                    .flat_map(|result| {
                        result
                            .map_err(|error| {
                                let array_error = InternalError::InsideArray(
                                    Box::new(error),
                                    array_context.path().clone(),
                                );
                                log::warn!("{array_error}");
                            })
                            .ok()
                    })
                    // A filter here is not needed since the object indexing will fail and not
                    // warn if the key is missing. This case is different from the Query::do_apply_array
                    .collect();
                Ok(Value::Array(indexed_array))
            }
            _ => Err(InternalError::NonIndexableValue(new_context.path().clone())),
        }
    }
}
