use anyhow::Result;
use clap::Parser;
use clap_verbosity_flag::Verbosity;
use clio::{Input, Output};
use gq_core::query::Query;
use serde_json::Value;
use std::io::{BufReader, BufWriter, Read};
/// Simple program to greet a person
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[clap(name = "gq")]
struct Args {
    /// JSON Input file, use '-' for stdin
    #[clap(value_parser, default_value = "-")]
    json_input: Input,

    #[clap(flatten)]
    query_group: InputQueryGroup,

    /// JSON Output file '-' for stdout
    #[clap(long, short, value_parser, default_value = "-")]
    output: Output,

    #[command(flatten)]
    verbose: Verbosity,

    #[clap(long)]
    tab: bool,

    #[clap(long)]
    indent: Option<usize>,
}

#[derive(Debug, clap::Args)]
#[group(required = true, multiple = false)]
struct InputQueryGroup {
    #[clap(long = "file", short = 'f', value_parser)]
    query_file: Option<Input>,

    #[clap(long, short, value_parser)]
    inline_query: Option<String>,
}

impl InputQueryGroup {
    fn query(self) -> Result<String, clio::Error> {
        // panic if both are provided or none
        match (self.query_file, self.inline_query) {
            (Some(_), Some(_)) => panic!("Both query file and inline query provided"),
            (None, None) => panic!("No query provided"),
            (Some(query_file), None) => {
                let mut buffer = BufReader::new(query_file);
                let mut query = String::new();
                buffer.read_to_string(&mut query)?;
                Ok(query)
            }
            (None, Some(inline_query)) => Ok(inline_query),
        }
    }
}

fn main() -> Result<()> {
    let args = Args::parse();

    env_logger::Builder::new()
        .filter_level(args.verbose.log_level_filter())
        .init();

    let json_input = BufReader::new(args.json_input);
    let output = BufWriter::new(args.output);

    // TODO: remove this type annotation
    let json_input = serde_json::from_reader(json_input)?;

    let input_query = args.query_group.query()?;

    // TODO: modify the try_from to Into<&str> so this can be just `&query`
    let query = Query::try_from(input_query.as_str())?;

    let result = query.apply(json_input)?;

    serde_json::to_writer(output, &result)?;

    Ok(())
}
