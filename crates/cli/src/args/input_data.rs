use std::io::{BufReader, Read};

use clap::{Args, ValueEnum};
use clio::Input;
use gq_core::data::Data;

#[derive(Debug, Clone, ValueEnum)]
pub enum InputType {
    Json,
    Yaml,
}

#[derive(Debug, Args)]
pub struct InputData {
    /// Input data file, use '-' for stdin
    #[clap(long, short, value_parser, default_value = "-")]
    pub input: Input,

    /// Input data type
    #[clap(long, short, default_value_t = InputType::Json)]
    #[arg(value_enum)]
    pub r#type: InputType,
}

impl TryFrom<InputData> for Data<'_> {
    type Error = clio::Error;

    fn try_from(input_data: InputData) -> Result<Self, Self::Error> {
        let mut buf_reader = BufReader::new(input_data.input);
        let mut buffer = String::new();
        buf_reader.read_to_string(&mut buffer)?;

        let result = match input_data.r#type {
            InputType::Json => Data::json(buffer.into()),
            InputType::Yaml => Data::yaml(buffer.into()),
        };

        Ok(result)
    }
}
