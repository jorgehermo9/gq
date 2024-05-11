use clap::Parser;
use clio::{Input, Output};
use serde_json::Value;
use std::io::BufReader;

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

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    let input = BufReader::new(args.input);
    let mut output = args.output;

    // TODO: remove this type annotation
    let input_json: Value = serde_json::from_reader(input)?;

    Ok(())
}
