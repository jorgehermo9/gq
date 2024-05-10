use std::{
    borrow::Cow,
    fmt::{self, Display, Formatter},
};

use derive_getters::Getters;
use derive_more::{Constructor, Display};
use serde_json::Value;

use super::{apply::InternalError, context::Context, query_arguments::QueryArguments};

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

    // TODO: inspect should return the indexed context? in a lot of places we index and then create
    // the indexed context
    // TODO: maybe we should move the InternalError::KeyNotFound to this module? so we are not using something
    // of the apply module here.
    pub fn inspect<'b>(
        &'a self,
        value: &'b Value,
        context: &Context<'a>,
    ) -> Result<Cow<'b, Value>, InternalError<'a>> {
        Self::do_inspect(
            Cow::Borrowed(value),
            self.keys(),
            &QueryArguments::default(),
            context,
        )
    }
    pub fn inspect_owned(
        &'a self,
        value: Value,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        self.inspect_owned_with_arguments(value, &QueryArguments::default(), context)
    }

    pub fn inspect_owned_with_arguments(
        &'a self,
        value: Value,
        arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Value, InternalError<'a>> {
        Self::do_inspect(Cow::Owned(value), self.keys(), arguments, context).map(Cow::into_owned)
    }

    // TODO:
    // Cow is used to handle both borrowed input data and owned input data, so there is no cloning
    // when we are given an owned value (for example, inspecting in the root query).
    // We still have the issue then the consumer wants to pass a reference as an input and only needs
    // a reference to the inspected value, not an owned Value (argument filtering).
    pub fn do_inspect<'b>(
        value: Cow<'b, Value>,
        keys: &'a [AtomicQueryKey<'a>],
        parent_arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Cow<'b, Value>, InternalError<'a>> {
        let result = match value {
            Cow::Owned(Value::Object(_)) | Cow::Borrowed(Value::Object(_)) => {
                Self::do_inspect_object(value, keys, parent_arguments, context)?
            }
            Cow::Owned(Value::Array(_)) | Cow::Borrowed(Value::Array(_)) => {
                Self::do_inspect_array(value, keys, parent_arguments, context)
            }
            value => Self::do_inspect_primitive(value, keys, parent_arguments, context)?,
        };
        Ok(result)
    }

    pub fn do_inspect_object<'b>(
        value: Cow<'b, Value>,
        keys: &'a [AtomicQueryKey<'a>],
        parent_arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Cow<'b, Value>, InternalError<'a>> {
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

        let current = match value {
            Cow::Owned(Value::Object(mut object)) => object
                .get_mut(raw_key.0.as_ref())
                .map(Value::take)
                .map(Cow::Owned),
            Cow::Borrowed(Value::Object(object)) => object
                // TODO: implement Borrow so we can do .get(raw_key)
                .get(raw_key.0.as_ref())
                .map(Cow::Borrowed),
            _ => unreachable!("In this match branch there are only Value::Object variants"),
        }
        .ok_or(InternalError::KeyNotFound(new_context.path().clone()))?;

        Self::do_inspect(current, rest, arguments, &new_context)
    }
    pub fn do_inspect_array<'b>(
        value: Cow<'b, Value>,
        keys: &'a [AtomicQueryKey<'a>],
        parent_arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Cow<'b, Value> {
        let array_context = context.enter_array();

        // TODO: think if there is a better way to do this, but I think this is the best we can do
        let array_iter: Box<dyn Iterator<Item = Cow<Value>>> = match value {
            Cow::Owned(Value::Array(array)) => Box::new(array.into_iter().map(Cow::Owned)),
            Cow::Borrowed(Value::Array(array)) => Box::new(array.iter().map(Cow::Borrowed)),
            _ => unreachable!("In this match branch there are only Value::Array variants"),
        };

        let result = array_iter
            .enumerate()
            .map(|(index, item)| (array_context.push_index(index), item))
            .filter(|(item_context, item)| parent_arguments.satisfies(item, item_context))
            .map(|(item_context, item)| {
                let default_query_arguments = QueryArguments::default();
                let arguments_to_propagate = match item {
                    // Only propagate parent_arguments if the child is an array
                    Cow::Owned(Value::Array(_)) | Cow::Borrowed(Value::Array(_)) => {
                        parent_arguments
                    }
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
            // We have to own the values if we want to return a Value::Array
            .map(Cow::into_owned)
            .collect();
        Cow::Owned(Value::Array(result))
    }

    pub fn do_inspect_primitive<'b>(
        value: Cow<'b, Value>,
        keys: &'a [AtomicQueryKey<'a>],
        parent_arguments: &QueryArguments<'a>,
        context: &Context<'a>,
    ) -> Result<Cow<'b, Value>, InternalError<'a>> {
        if !parent_arguments.0.is_empty() {
            return Err(InternalError::NonFiltrableValue(context.path().clone()));
        }
        if !keys.is_empty() {
            return Err(InternalError::NonIndexableValue(context.path().clone()));
        }
        Ok(value)
    }
}
