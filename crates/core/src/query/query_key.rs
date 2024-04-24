use std::{
    borrow::{Borrow, Cow},
    fmt::{self, Display, Formatter},
};

use derive_getters::Getters;
use derive_more::{Constructor, Display};

use super::QueryArguments;

// TODO: maybe we shouldn't name those types
pub type OwnedRawKey = RawKey<'static>;
pub type OwnedAtomicQueryKey = AtomicQueryKey<'static>;
pub type OwnedQueryKey = QueryKey<'static>;

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

impl AtomicQueryKey<'_> {
    pub fn into_owned(self) -> OwnedAtomicQueryKey {
        todo!("TODO")
        // AtomicQueryKey(Cow::Owned(self.0.into_owned()))
    }
}

impl Display for AtomicQueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        // self.0.fmt(f)
        todo!("TODO")
    }
}

#[derive(Debug, Clone, Constructor, Getters)]
pub struct QueryKey<'a> {
    keys: Vec<AtomicQueryKey<'a>>,
}

impl QueryKey<'_> {
    pub fn into_owned(self) -> OwnedQueryKey {
        QueryKey {
            keys: self
                .keys
                .into_iter()
                .map(AtomicQueryKey::into_owned)
                .collect(),
        }
    }
}

impl Display for QueryKey<'_> {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let keys = self
            .keys()
            .iter()
            .map(|key| key.key().0.as_ref())
            .collect::<Vec<_>>()
            .join(".");
        keys.fmt(f)
    }
}

impl<'a> QueryKey<'a> {
    pub fn last_key(&self) -> &AtomicQueryKey<'a> {
        self.keys().last().expect("query key cannot be empty")
    }
}
