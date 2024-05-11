use clap::{Parser, ValueEnum};
use clio::{Input, Output};
use serde_json::Value;
use std::io::{BufReader, Read, Write};

/// Simple program to greet a person
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[clap(name = "gq")]
struct Args {
    /// JSON Input file, use '-' for stdin
    #[clap(value_parser, default_value = "-")]
    input: Input,

    #[clap(long, short, value_parser)]
    query_file: Option<Input>,

    #[clap(long, short, value_parser)]
    inline_query: Option<String>,
    /// JSON Output file '-' for stdout
    #[clap(long, short, value_parser, default_value = "-")]
    output: Output,
}

fn get_input_json(input: Input) -> Result<Value, serde_json::Error> {
    let buffered_reader = BufReader::new(input);
    let input_json = serde_json::from_reader(buffered_reader)?;
    Ok(input_json)
}
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    let mut input = args.input;
    let mut output = args.output;

    let input_json = get_input_json(input)?;

    Ok(())
}
