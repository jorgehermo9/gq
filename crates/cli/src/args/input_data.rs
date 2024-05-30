use std::io::{BufReader, Read};

use clap::Args;
use clio::Input;
use gq_core::data::Data;

#[derive(Debug, Args)]
pub struct InputDataArgs {
    /// Input datga file, use '-' for stdin
    #[clap(long, short, value_parser, default_value = "-")]
    pub input: Input,
    // TODO: boolean flag or an enum with Json and Yaml variants?
    #[clap(long)]
    pub yaml: bool,
}

impl TryFrom<InputDataArgs> for Data<'_> {
    type Error = clio::Error;

    fn try_from(args: InputDataArgs) -> Result<Self, Self::Error> {
        let mut buf_reader = BufReader::new(args.input);
        let mut buffer = String::new();
        buf_reader.read_to_string(&mut buffer)?;

        let data = if args.yaml {
            Data::yaml(buffer.into())
        } else {
            Data::json(buffer.into())
        };

        Ok(data)
    }
}
