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
