use derive_getters::Getters;
use derive_more::Constructor;

#[derive(Debug)]
pub enum QueryKey<'a> {
    Root,
    Named { name: &'a str },
}

impl<'a> QueryKey<'a> {
    pub fn named(name: &'a str) -> Self {
        Self::Named { name }
    }
}

#[derive(Constructor, Getters, Debug)]
pub struct Query<'a> {
    key: QueryKey<'a>,
    children: Vec<Query<'a>>,
}

impl<'a> Query<'a> {
    pub fn root_with_children(children: Vec<Query<'a>>) -> Self {
        Self::new(QueryKey::Root, children)
    }
    pub fn named_empty(name: &'a str) -> Self {
        Self::new(QueryKey::named(name), Vec::new())
    }
    pub fn named_with_children(name: &'a str, children: Vec<Query<'a>>) -> Self {
        Self::new(QueryKey::named(name), children)
    }
}
