use serde_json::{Map, Value};
use thiserror::Error;

use super::{
    context::{Context, JsonPath, OwnedJsonPath},
    ChildQuery, Query,
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
    #[error("tried to apply arguments in a non-filtrable value (not an array) at '{0}'")]
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
            InternalError::NonFiltrableValue(path) => {
                Error::NonFiltrableValue(OwnedJsonPath::from(&path))
            }
        }
    }
}

//TODO: maybe this is useless, it is only useful for the '?' syntax to convert a borrowed error into an owned error
#[derive(Debug, Error, Clone)]
pub enum InternalError<'a> {
    #[error("key '{0}' not found")]
    KeyNotFound(JsonPath<'a>),
    // TODO: Think about the usefulness of this error
    #[error("{0} while indexing inside array '{1}'")]
    InsideArray(Box<Self>, JsonPath<'a>),
    #[error("tried to index a non-indexable value (neither object nor array) at '{0}'")]
    NonIndexableValue(JsonPath<'a>),

    #[error("tried to apply arguments in a non-filtrable value (not an array) at '{0}'")]
    NonFiltrableValue(JsonPath<'a>),
}

impl Query<'_> {
    pub fn apply(&self, root_json: Value) -> Result<Value, Error> {
        let root_context = Context::new();

        let root_query_key = self.key();
        let new_root_json = root_query_key.inspect_owned_with_arguments(
            root_json,
            self.arguments(),
            &root_context,
        )?;
        // TODO: maybe the inspect function should return the inspected context
        let new_context = root_context.push_query_key(root_query_key);

        Ok(self.do_apply(new_root_json, new_context)?)
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
                (Ok(value), _) => value.into_owned(),
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
            .map(|(item_context, item)| self.do_apply(item, item_context))
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
                Value::Array(array) => !array.is_empty(),
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
