use std::{
    borrow::Cow,
    fmt::{self, Display, Formatter},
};

use derive_getters::Getters;
use derive_more::Constructor;

#[derive(Debug, Clone, Constructor, PartialEq, Eq, Hash)]
pub struct AtomicQueryKey<'a>(pub Cow<'a, str>);

impl AtomicQueryKey<'_> {
    pub fn into_owned(self) -> AtomicQueryKey<'static> {
        AtomicQueryKey(Cow::Owned(self.0.into_owned()))
    }
}

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
            .map(|key| key.0.as_ref())
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
