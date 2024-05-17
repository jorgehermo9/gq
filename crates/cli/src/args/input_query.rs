use std::io::{BufReader, Read};

use clio::Input;

#[derive(Debug, clap::Args)]
#[group(required = false, multiple = false)]
pub struct InputQueryArgs {
    /// Inline query
    #[clap(value_parser, default_value = "{}")]
    query: Option<String>,

    /// Load query from file
    #[clap(long = "file", short = 'f', value_parser)]
    query_file: Option<Input>,
}

impl InputQueryArgs {
    pub fn query(self) -> Result<String, clio::Error> {
        // panic if both are provided or none
        match (self.query_file, self.query) {
            (None, None) => panic!("No query provided"),
            (None, Some(inline_query)) => Ok(inline_query),
            (Some(query_file), _) => {
                let mut buffer = BufReader::new(query_file);
                let mut query = String::new();
                buffer.read_to_string(&mut query)?;
                Ok(query)
            }
        }
    }
}
