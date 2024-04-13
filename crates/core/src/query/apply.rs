use serde_json::{Map, Value};
use thiserror::Error;

use super::{
    context::{Context, JsonPath, JsonPathEntry, OwnedJsonPath},
    AtomicQueryKey, ChildQuery, QueryKey, RootQuery,
};

#[derive(Debug, Error)]
pub enum Error {
    // TODO: 'key' should be in lowercase or capitalized?
    #[error("key '{0}' not found")]
    KeyNotFound(OwnedJsonPath),
    #[error("{0} while filtering inside array '{1}'")]
    InsideArray(Box<Self>, OwnedJsonPath),
    // TODO: display the children keys in errors?
    #[error("tried to index a non-indexable value (neither object nor array) at '{0}'")]
    NonIndexableValue(OwnedJsonPath),
}

impl From<InternalError<'_>> for Error {
    fn from(internal_error: InternalError) -> Self {
        match internal_error {
            InternalError::KeyNotFound(path) => Error::KeyNotFound(OwnedJsonPath::from(&path)),
            InternalError::InsideArray(internal_error, path) => Error::InsideArray(
                Box::new(Error::from(*internal_error)),
                OwnedJsonPath::from(&path),
            ),
            InternalError::NonIndexableValue(path) => {
                Error::NonIndexableValue(OwnedJsonPath::from(&path))
            }
        }
    }
}

//TODO: maybe this is useless, it is only useful for the '?' syntax to convert a borrowed error into an owned error
#[derive(Debug, Error)]
enum InternalError<'a> {
    #[error("key '{0}' not found")]
    KeyNotFound(JsonPath<'a>),
    // TODO: Think about the usefulness of this error
    #[error("{0} while filtering inside array '{1}'")]
    InsideArray(Box<Self>, JsonPath<'a>),
    #[error("tried to index a non-indexable value (neither object nor array) at '{0}'")]
    NonIndexableValue(JsonPath<'a>),
}

impl RootQuery<'_> {
    pub fn apply(&self, root_json: Value) -> Result<Value, Error> {
        let root_context = Context::new();
        let (new_root_json, root_context) = match (self.key(), root_json) {
            // TODO: maybe this is not the right way to do it...
            (Some(query_key), value) => {
                let new_root_json = query_key.inspect(&value, &root_context)?;
                let new_context = root_context.push_query_key(query_key);
                (new_root_json, new_context)
            }
            (None, root_json) => (root_json, root_context),
        };

        Ok(self.do_apply(new_root_json, root_context)?)
    }
}

trait QueryApply {
    fn children(&self) -> &Vec<ChildQuery>;
    fn do_apply<'a>(
        &'a self,
        value: Value,
        context: Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        if self.children().is_empty() {
            return Ok(value);
        }

        match value {
            Value::Object(object) => self.do_apply_object(object, context),
            Value::Array(array) => Ok(self.do_apply_array(array, context)),
            _ => Err(InternalError::NonIndexableValue(context.path().clone()))?,
        }
    }
    fn do_apply_object<'a>(
        &'a self,
        object: Map<String, Value>,
        context: Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        let mut filtered_object = serde_json::Map::new();
        // TODO: check if this is necessary
        let value = &Value::Object(object);
        for child in self.children() {
            let child_query_key = child.key();
            let child_value_result = child_query_key.inspect(value, &context);
            let child_context = context.push_query_key(child_query_key);

            let child_value = match (child_value_result, child_context.array_context()) {
                (Ok(value), _) => value,
                (Err(internal_error), None) => return Err(internal_error),
                (Err(internal_error), Some(array_context)) => {
                    let array_error = InternalError::InsideArray(
                        Box::new(internal_error),
                        array_context.path().clone(),
                    );
                    log::warn!("{array_error}");
                    continue;
                }
            };

            let child_filtered_value_result = child.do_apply(child_value, child_context.clone());
            let child_filtered_value =
                match (child_filtered_value_result, child_context.array_context()) {
                    (Ok(value), _) => value,
                    (Err(child_error), None) => return Err(child_error),
                    (Err(child_error), Some(array_context)) => {
                        let array_error = InternalError::InsideArray(
                            Box::new(child_error),
                            array_context.path().clone(),
                        );
                        log::warn!("{array_error}");
                        continue;
                    }
                };
            filtered_object.insert(child.output_key().to_string(), child_filtered_value);
        }
        Ok(Value::Object(filtered_object))
    }
    fn do_apply_array(&self, array: Vec<Value>, context: Context) -> Value {
        let array_context = context.enter_array();
        let filtered_array = array
            .into_iter()
            .enumerate()
            .map(|(index, item)| {
                let item_context = array_context.push_entry(JsonPathEntry::Index(index));
                self.do_apply(item, item_context)
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
            .filter(|value| match value {
                Value::Object(object) => !object.is_empty(),
                _ => true,
            })
            .collect();
        Value::Array(filtered_array)
    }
}

impl QueryApply for RootQuery<'_> {
    fn children(&self) -> &Vec<ChildQuery> {
        self.children()
    }
}

impl QueryApply for ChildQuery<'_> {
    fn children(&self) -> &Vec<ChildQuery> {
        self.children()
    }
}

// impl Query<'_> {
//     fn do_apply<'a>(
//         &'a self,
//         value: Value,
//         context: Context<'a>,
//     ) -> Result<Value, InternalError<'a>> {
//         // TODO: maybe we should make a differece while representing `field1{ }` and `field1`, since in the fist case
//         // the intent might be to filter an object... but the way we are representing it now, it is the same as `field1`,
//         // which is just using empty children... given the following json `{"field1": 1}` and the query `{field1{}}` we should
//         // fail? it is different from `{field1}`?
//         if self.children().is_empty() {
//             return Ok(value);
//         }

//         match value {
//             Value::Object(object) => self.do_apply_object(object, context),
//             Value::Array(array) => Ok(self.do_apply_array(array, context)),
//             _ => Err(InternalError::NonIndexableValue(context.path().clone()))?,
//         }
//     }

//     fn do_apply_object<'a>(
//         &'a self,
//         object: Map<String, Value>,
//         context: Context<'a>,
//     ) -> Result<Value, InternalError<'a>> {
//         let mut filtered_object = serde_json::Map::new();
//         // TODO: check if this is necessary
//         let value = &Value::Object(object);
//         for child in self.children() {
//             let Some(child_query_key) = child.key() else {
//                 panic!("children query must have a key");
//             };

//             let child_value_result = child_query_key.inspect(value, &context);
//             let child_context = context.push_query_key(child_query_key);

//             let child_value = match (child_value_result, child_context.array_context()) {
//                 (Ok(value), _) => value,
//                 (Err(internal_error), None) => return Err(internal_error),
//                 (Err(internal_error), Some(array_context)) => {
//                     let array_error = InternalError::InsideArray(
//                         Box::new(internal_error),
//                         array_context.path().clone(),
//                     );
//                     log::warn!("{array_error}");
//                     continue;
//                 }
//             };

//             let child_filtered_value_result = child.do_apply(child_value, child_context.clone());
//             let child_filtered_value =
//                 match (child_filtered_value_result, child_context.array_context()) {
//                     (Ok(value), _) => value,
//                     (Err(child_error), None) => return Err(child_error),
//                     (Err(child_error), Some(array_context)) => {
//                         let array_error = InternalError::InsideArray(
//                             Box::new(child_error),
//                             array_context.path().clone(),
//                         );
//                         log::warn!("{array_error}");
//                         continue;
//                     }
//                 };
//             filtered_object.insert(child.output_key().to_string(), child_filtered_value);
//         }
//         Ok(Value::Object(filtered_object))
//     }

//     fn do_apply_array(&self, array: Vec<Value>, context: Context) -> Value {
//         let array_context = context.enter_array();
//         let filtered_array = array
//             .into_iter()
//             .enumerate()
//             .map(|(index, item)| {
//                 let item_context = array_context.push_entry(JsonPathEntry::Index(index));
//                 self.do_apply(item, item_context)
//             })
//             .flat_map(|result| {
//                 result
//                     .map_err(|error| {
//                         let array_error = InternalError::InsideArray(
//                             Box::new(error),
//                             array_context.path().clone(),
//                         );
//                         log::warn!("{array_error}");
//                     })
//                     .ok()
//             })
//             .filter(|value| match value {
//                 Value::Object(object) => !object.is_empty(),
//                 _ => true,
//             })
//             .collect();
//         Value::Array(filtered_array)
//     }
// }

impl<'a> QueryKey<'a> {
    fn inspect(&'a self, value: &Value, context: &Context<'a>) -> Result<Value, InternalError<'a>> {
        Self::do_inspect(value, self.keys(), context)
    }
    fn do_inspect(
        value: &Value,
        keys: &'a [AtomicQueryKey<'a>],
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
                    .get(current_key.as_ref())
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
