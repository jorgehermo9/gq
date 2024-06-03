use std::io::{BufReader, Read};

use clap::Args;
use clio::Input;

#[derive(Debug, Args)]
#[group(required = false, multiple = false)]
pub struct InputQuery {
    /// Inline query
    #[clap(value_parser, default_value = "{}")]
    query: String,

    /// Load query from file
    #[clap(long = "file", short = 'f', value_parser)]
    query_file: Option<Input>,
}

impl TryFrom<InputQuery> for String {
    type Error = clio::Error;

    fn try_from(input_query: InputQuery) -> Result<Self, Self::Error> {
        match input_query.query_file {
            None => Ok(input_query.query),
            Some(query_file) => {
                let mut buffer = BufReader::new(query_file);
                let mut query = String::new();
                buffer.read_to_string(&mut query)?;
                Ok(query)
            }
        }
    }
}
