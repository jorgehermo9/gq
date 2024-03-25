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

// TODO: create a print method for Query, to print the query in the same format
// as it would be parsed, and add tests for it so we can test that the parser
// and the printer are inverses of each other. generate random queries
// with some crate and then parse them and print them and check that the printed
// query is the same as the original query.

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
