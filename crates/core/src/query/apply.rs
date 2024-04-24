use serde_json::{Map, Value};
use thiserror::Error;

use super::{
    context::{Context, JsonPath, OwnedJsonPath},
    AtomicQueryKey, ChildQuery, Query, QueryArgument, QueryArgumentValue, QueryArguments, QueryKey,
};

#[derive(Debug, Error)]
pub enum Error {
    // TODO: use a JsonPath<'static> instead of OwnedJsonPath?
    #[error("key '{0}' not found")]
    KeyNotFound(OwnedJsonPath),
    #[error("{0} while indexing inside array '{1}'")]
    InsideArray(Box<Self>, OwnedJsonPath),
    #[error("tried to index a non-indexable value (neither object nor array) at '{0}'")]
    NonIndexableValue(OwnedJsonPath),
    #[error("{0} while filtering inside argument '{1}' at query '{2}'")]
    InsideArguments(Box<Self>, QueryKey<'static>, OwnedJsonPath),
    // TODO: improve the display mesage of this error?
    #[error("tried to filter a non-filtrable value (not an array) at '{0}'")]
    NonFiltrableValue(OwnedJsonPath),
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
            InternalError::InsideArguments(internal_error, argument_key, path) => {
                Error::InsideArguments(
                    Box::new(Error::from(*internal_error)),
                    argument_key.into_owned(),
                    OwnedJsonPath::from(&path),
                )
            }
            InternalError::NonFiltrableValue(path) => {
                Error::NonFiltrableValue(OwnedJsonPath::from(&path))
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
    #[error("{0} while indexing inside array '{1}'")]
    InsideArray(Box<Self>, JsonPath<'a>),
    #[error("tried to index a non-indexable value (neither object nor array) at '{0}'")]
    NonIndexableValue(JsonPath<'a>),
    #[error("{0} while filtering inside argument '{1}' at query '{2}'")]
    InsideArguments(Box<Self>, QueryKey<'a>, JsonPath<'a>),
    #[error("tried to filter a non-filtrable value (not an array) at '{0}'")]
    NonFiltrableValue(JsonPath<'a>),
}

impl Query<'_> {
    pub fn apply(&self, root_json: Value) -> Result<Value, Error> {
        let root_context = Context::new();
        // TODO: apply QueryArguments here
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
        match value {
            Value::Object(object) => self.do_apply_object(object, context),
            Value::Array(array) => Ok(self.do_apply_array(array, context)),
            _ => self.do_apply_primitive(value, context),
        }
    }

    fn do_apply_primitive<'a>(
        &'a self,
        value: Value,
        context: Context<'a>,
    ) -> Result<Value, InternalError> {
        if !self.children().is_empty() {
            return Err(InternalError::NonIndexableValue(context.path().clone()));
        }
        Ok(value)
    }

    fn do_apply_object<'a>(
        &'a self,
        object: Map<String, Value>,
        context: Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        if self.children().is_empty() {
            return Ok(Value::Object(object));
        }

        let mut filtered_object = serde_json::Map::new();
        // TODO: check if this is necessary or redundant
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
            .map(|(index, item)| (array_context.push_index(index), item))
            .map(|(context, item)| self.do_apply(item, context))
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

impl QueryApply for Query<'_> {
    fn children(&self) -> &Vec<ChildQuery> {
        self.children()
    }
}

impl QueryApply for ChildQuery<'_> {
    fn children(&self) -> &Vec<ChildQuery> {
        self.children()
    }
}

//TODO: maybe we should move this to the query_key module
impl<'a> QueryKey<'a> {
    fn inspect(&'a self, value: &Value, context: &Context<'a>) -> Result<Value, InternalError<'a>> {
        Self::do_inspect(value, self.keys(), &QueryArguments::empty(), context)
    }
    fn do_inspect(
        value: &Value,
        keys: &'a [AtomicQueryKey<'a>],
        parent_arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        let Some((atomic_query_key, rest)) = keys.split_first() else {
            // TODO: try to return a reference here and clone in the caller, so this is more flexible for
            // callers that only needs a reference. For example, the QueryArguments...

            let value = value.clone();
            let value = match value {
                Value::Array(array) => {
                    let array_context = context.enter_array();
                    let filtered_array = array
                        .into_iter()
                        .enumerate()
                        .map(|(index, item)| (array_context.push_index(index), item))
                        .filter(|(item_context, item)| {
                            parent_arguments.filter(item, item_context, &context)
                        })
                        .map(|(_, item)| item)
                        .collect();
                    Value::Array(filtered_array)
                }
                _ if !parent_arguments.0.is_empty() => {
                    return Err(InternalError::NonFiltrableValue(context.path().clone()));
                }
                _ => value,
            };
            return Ok(value);
        };

        let raw_key = atomic_query_key.key();
        let arguments = atomic_query_key.arguments();
        // TODO: all the context here are misused, review them all
        let new_context = context.push_raw_key(raw_key);
        match value {
            Value::Object(object) => {
                // TODO: fail here if there is arguments
                let current = object
                    // TODO: implement Borrow so we can do .get(raw_key)
                    .get(raw_key.0.as_ref())
                    .ok_or(InternalError::KeyNotFound(new_context.path().clone()))?;
                Self::do_inspect(current, rest, arguments, &new_context)
            }
            Value::Array(array) => {
                // TODO: handle arguments here
                let array_context = context.enter_array();
                let indexed_array = array
                    .iter()
                    .enumerate()
                    //TODO the filter is before the map
                    .map(|(index, item)| (array_context.push_index(index), item))
                    .filter(|(item_context, item)| {
                        parent_arguments.filter(item, item_context, &new_context)
                    })
                    .map(|(item_context, item)| {
                        // We have to send an empty QueryArguments so the arguments do not propagate twice to the
                        // array items
                        Self::do_inspect(item, keys, &QueryArguments::empty(), &item_context)
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
                // TODO: maybe we should create a borrowed version of Value::Array so this method could return a reference
                Ok(Value::Array(indexed_array))
            }
            _ => Err(InternalError::NonIndexableValue(new_context.path().clone())),
        }
    }
}

// TODO: maybe we should move this to the query_argument module
impl<'a> QueryArguments<'a> {
    //TODO: improve method naming
    //TODO: maybe parent_context is not necessary, think better about the errors
    fn filter(
        &'a self,
        value: &Value,
        argument_context: &Context<'a>,
        context: &Context<'a>,
    ) -> bool {
        self.0.iter().all(|argument| {
            argument
                .filter(value, argument_context)
                .map_err(|error| {
                    let argument_error = InternalError::InsideArguments(
                        Box::new(error),
                        // TODO: verify if QueryKey::clone is expensive
                        argument.key().clone(),
                        context.path().clone(),
                    );
                    log::warn!("{argument_error}");
                })
                .unwrap_or(false)
        })
    }
}

impl<'a> QueryArgument<'a> {
    fn filter(&'a self, value: &Value, context: &Context<'a>) -> Result<bool, InternalError<'a>> {
        let argument_key = self.key();
        let argument_value = self.value();
        let inspected_value = argument_key.inspect(value, context)?;
        Self::fulfill_argument(&inspected_value, argument_value)
    }

    //TODO: improve naming
    fn fulfill_argument(
        value: &Value,
        argument_value: &QueryArgumentValue,
    ) -> Result<bool, InternalError<'a>> {
        let fulfill = match (value, argument_value) {
            (Value::String(value), QueryArgumentValue::String(argument_value)) => {
                value == argument_value
            }
            (Value::Number(value), QueryArgumentValue::Number(argument_value)) => {
                // TODO: improve this conversion
                value
                    .as_f64()
                    .expect("TODO: improve number value conversion")
                    == *argument_value
            }
            (Value::Bool(value), QueryArgumentValue::Bool(argument_value)) => {
                value == argument_value
            }
            (Value::Null, QueryArgumentValue::Null) => true,
            (Value::Array(array), argument_value) => array.iter().any(|item| {
                // TODO: when an error occurs here, we should log a warn and return false
                Self::fulfill_argument(item, argument_value).expect("TODO: handle this error")
            }),
            (value, argument_value) => {
                // TODO: do some error handling here reporting the incompatible types. We should raise an error ere
                log::warn!(
                    "TODO: handle incompatible types error '{value}' and '{argument_value}'"
                );
                false
            }
        };
        Ok(fulfill)
    }
}
