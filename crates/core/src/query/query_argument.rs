use super::QueryKey;
use derive_getters::Getters;
use derive_more::Constructor;

#[derive(Debug, Clone)]
pub enum QueryArgumentValue<'a> {
    String(&'a str),
    Number(f64),
    Bool(bool),
    Null,
}

#[derive(Debug, Clone, Constructor, Getters)]
pub struct QueryArgument<'a> {
    key: QueryKey<'a>,
    value: QueryArgumentValue<'a>,
}

// TODO: create an filter method that returns a boolean...
// maybe the QueryKey::inspect should return a reference to que inspected
// value, as we do not need ownership, only to check equality to the inspected
// value... The apply should receive a Vec<Value> and inspect each value
// with the query key