use derive_getters::Getters;
use derive_more::Constructor;
use serde_json::Value;
use thiserror::Error;

// TODO: create a print method for Query, to print the query in the same format
// as it would be parsed, and add tests for it so we can test that the parser
// and the printer are inverses of each other. generate random queries
// with some crate and then parse them and print them and check that the printed
// query is the same as the original query.

#[derive(Debug)]
pub struct QueryKey<'a>(&'a str);

// TODO: make the invalid states irrepresentable, the children could never be None...
// maybe the Query struct should have a children field that is a Vec<ChildrenQuery>, which
// cannot allow to unnamed keys...
#[derive(Constructor, Getters, Debug)]
pub struct Query<'a> {
    key: Option<QueryKey<'a>>,
    children: Vec<Self>,
}
impl<'a> Query<'a> {
    pub fn unnamed_with_children(children: Vec<Self>) -> Self {
        Self::new(None, children)
    }
    pub fn named_empty(name: &'a str) -> Self {
        Self::new(Some(QueryKey(name)), Vec::new())
    }
    pub fn named_with_children(name: &'a str, children: Vec<Self>) -> Self {
        Self::new(Some(QueryKey(name)), children)
    }
}

#[derive(Debug, Error)]
pub enum Error {}

impl Query<'_> {
    fn apply(&self, json: Value) -> Result<Value, Error> {
        todo!()
    }
}
