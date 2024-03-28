use derive_getters::Getters;
use derive_more::Constructor;
use serde_json::Value;
use thiserror::Error;

#[derive(Debug)]
pub struct QueryKey<'a>(&'a str);

// TODO: create a print method for Query, to print the query in the same format
// as it would be parsed, and add tests for it so we can test that the parser
// and the printer are inverses of each other. generate random queries
// with some crate and then parse them and print them and check that the printed
// query is the same as the original query.

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
pub enum Error {
    #[error("Key not found")]
    KeyNotFound,
}

impl Query<'_> {
    pub fn apply(&self, mut json: Value) -> Result<Value, Error> {
        let root_json = match self.key() {
            // TODO: check if json is an object
            Some(QueryKey(key)) => json.get_mut(key).ok_or(Error::KeyNotFound)?.take(),
            None => json,
        };

        self.do_apply(root_json)
    }

    fn do_apply(&self, json: Value) -> Result<Value, Error> {
        let children = self.children();
        if children.is_empty() {
            return Ok(json);
        }

        match json {
            Value::Object(mut old_object) => {
                let mut filtered_object = serde_json::Map::new();
                // TODO: can this be done with a more functional approach, like the Value::Array case?
                for child in children {
                    let Some(QueryKey(key)) = child.key() else {
                        panic!("children query must have a key");
                    };
                    let child_value = old_object.get_mut(*key).ok_or(Error::KeyNotFound)?.take();
                    let child_filtered_value = child.do_apply(child_value)?;
                    filtered_object.insert(key.to_string(), child_filtered_value);
                }
                Ok(Value::Object(filtered_object))
            }
            Value::Array(old_array) => {
                let filtered_array = old_array
                    .into_iter()
                    .map(|value| self.do_apply(value))
                    // TODO: fail with just a warning? Return a more complex type from this function
                    // maybe with a vector of error which could be warnings... should we support arrays with different
                    // types of values?
                    .collect::<Result<Vec<Value>, Error>>()?;
                Ok(Value::Array(filtered_array))
            }
            // TODO: handle error if there are more children left...
            _ => Ok(json),
        }
    }
}
