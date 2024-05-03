use std::{
    borrow::Cow,
    fmt::{self, Display, Formatter},
};

use derive_getters::Getters;
use derive_more::{Constructor, Display};
use serde_json::Value;

use super::{apply::InternalError, context::Context, query_arguments::QueryArguments};

// TODO: maybe we shouldn't name those types
pub type OwnedRawKey = RawKey<'static>;

#[derive(Debug, Clone, Constructor, Eq, PartialEq, Hash, Display)]
pub struct RawKey<'a>(pub Cow<'a, str>);

impl RawKey<'_> {
    pub fn into_owned(self) -> OwnedRawKey {
        RawKey(Cow::Owned(self.0.into_owned()))
    }
}

#[derive(Debug, Clone, Constructor, Getters)]
pub struct AtomicQueryKey<'a> {
    // TODO: rename those attributes?
    key: RawKey<'a>,
    arguments: QueryArguments<'a>,
}

impl Display for AtomicQueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let key = self.key().to_string();
        if self.arguments().0.is_empty() {
            return key.fmt(f);
        }

        let arguments = self.arguments().to_string();
        write!(f, "{key}({arguments})")
    }
}

#[derive(Debug, Clone, Constructor, Getters, Default)]
pub struct QueryKey<'a> {
    keys: Vec<AtomicQueryKey<'a>>,
}

// TODO: maybe it does not make sense to have a .into_owned method, it pollutes a lot the QueryArguments
// and it is mainly used on errors. Maybe the error should have simply a String that represents the QueryKey
// and do not complicate this so much.

impl Display for QueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let keys = self
            .keys()
            .iter()
            .map(ToString::to_string)
            .collect::<Vec<_>>()
            .join(".");
        keys.fmt(f)
    }
}

impl<'a> QueryKey<'a> {
    pub fn last_key(&self) -> &AtomicQueryKey<'a> {
        self.keys().last().expect("query key cannot be empty")
    }

    // TODO: reduce code duplication with inspect_owned
    pub fn inspect(
        &'a self,
        value: &Value,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        Self::do_inspect(value, self.keys(), &QueryArguments::default(), context)
    }

    pub fn inspect_with_arguments(
        &'a self,
        value: &Value,
        arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        Self::do_inspect(value, self.keys(), arguments, context)
    }

    pub fn do_inspect(
        value: &Value,
        keys: &'a [AtomicQueryKey<'a>],
        parent_arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        // TODO: split in do_inspect_object, do_inspect_array and do_inspect_primitive
        let result = match value {
            Value::Object(object) => {
                if !parent_arguments.0.is_empty() {
                    // TODO: throw an error here or log a warning?
                    // in my opinion we should fail
                    return Err(InternalError::NonFiltrableValue(context.path().clone()));
                }

                let Some((atomic_query_key, rest)) = keys.split_first() else {
                    return Ok(value.clone());
                };

                let raw_key = atomic_query_key.key();
                let arguments = atomic_query_key.arguments();
                let new_context = context.push_raw_key(raw_key);

                let current = object
                    // TODO: implement Borrow so we can do .get(raw_key)
                    .get(raw_key.0.as_ref())
                    .ok_or(InternalError::KeyNotFound(new_context.path().clone()))?;

                Self::do_inspect(current, rest, arguments, &new_context)?
            }
            Value::Array(array) => {
                let array_context = context.enter_array();
                let result = array
                    .iter()
                    .enumerate()
                    .map(|(index, item)| (array_context.push_index(index), item))
                    .filter(|(item_context, item)| parent_arguments.satisfies(item, item_context))
                    .map(|(item_context, item)| {
                        let default_query_arguments = QueryArguments::default();
                        let arguments_to_propagate = match item {
                            // Only propagate parent_arguments if the child is an array
                            Value::Array(_) => parent_arguments,
                            _ => &default_query_arguments,
                        };
                        Self::do_inspect(item, keys, arguments_to_propagate, &item_context)
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
                    .collect();
                Value::Array(result)
            }
            value => {
                if !parent_arguments.0.is_empty() {
                    return Err(InternalError::NonFiltrableValue(context.path().clone()));
                }
                if !keys.is_empty() {
                    return Err(InternalError::NonIndexableValue(context.path().clone()));
                }
                value.clone()
            }
        };
        Ok(result)
    }

    pub fn inspect_owned(
        &'a self,
        value: Value,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        Self::do_inspect_owned(value, self.keys(), &QueryArguments::default(), context)
    }

    pub fn inspect_owned_with_arguments(
        &'a self,
        value: Value,
        arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        Self::do_inspect_owned(value, self.keys(), arguments, context)
    }

    // TODO: reduce code duplication with do_inspect
    pub fn do_inspect_owned(
        mut value: Value,
        keys: &'a [AtomicQueryKey<'a>],
        parent_arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        // TODO: split in do_inspect_object, do_inspect_array and do_inspect_primitive
        let result = match value {
            Value::Object(ref mut object) => {
                if !parent_arguments.0.is_empty() {
                    // TODO: throw an error here or log a warning?
                    // in my opinion we should fail
                    return Err(InternalError::NonFiltrableValue(context.path().clone()));
                }

                let Some((atomic_query_key, rest)) = keys.split_first() else {
                    return Ok(value);
                };

                let raw_key = atomic_query_key.key();
                let arguments = atomic_query_key.arguments();
                let new_context = context.push_raw_key(raw_key);

                let current = object
                    // TODO: implement Borrow so we can do .get(raw_key)
                    .get_mut(raw_key.0.as_ref())
                    .map(Value::take)
                    .ok_or(InternalError::KeyNotFound(new_context.path().clone()))?;

                Self::do_inspect_owned(current, rest, arguments, &new_context)?
            }
            Value::Array(array) => {
                let array_context = context.enter_array();
                let result = array
                    .into_iter()
                    .enumerate()
                    .map(|(index, item)| (array_context.push_index(index), item))
                    .filter(|(item_context, item)| parent_arguments.satisfies(item, item_context))
                    .map(|(item_context, item)| {
                        let default_query_arguments = QueryArguments::default();
                        let arguments_to_propagate = match item {
                            // Only propagate parent_arguments if the child is an array
                            Value::Array(_) => parent_arguments,
                            _ => &default_query_arguments,
                        };
                        Self::do_inspect_owned(item, keys, arguments_to_propagate, &item_context)
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
                    .collect();
                Value::Array(result)
            }
            value => {
                if !parent_arguments.0.is_empty() {
                    return Err(InternalError::NonFiltrableValue(context.path().clone()));
                }
                if !keys.is_empty() {
                    return Err(InternalError::NonIndexableValue(context.path().clone()));
                }
                value
            }
        };
        Ok(result)
    }
}
