use thiserror::Error;

use super::context::{JsonPath, OwnedJsonPath};

// TODO: move errors into their own module
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
pub enum InternalError<'a> {
    #[error("key '{0}' not found")]
    KeyNotFound(JsonPath<'a>),
    // TODO: Think about the usefulness of this error
    #[error("{0} while filtering inside array '{1}'")]
    InsideArray(Box<Self>, JsonPath<'a>),
    #[error("tried to index a non-indexable value (neither object nor array) at '{0}'")]
    NonIndexableValue(JsonPath<'a>),
}
