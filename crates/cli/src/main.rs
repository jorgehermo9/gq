use anyhow::Result;
use clap::Parser;
use gq_cli::{args::Args, output::WriteValue};
use gq_core::query::Query;
use std::io::BufReader;
/// Simple program to greet a person

fn main() -> Result<()> {
    let args = Args::parse();

    env_logger::Builder::new()
        .filter_level(args.verbose.log_level_filter())
        .init();

    let buf_input = BufReader::new(args.input);

    let input_json = serde_json::from_reader(buf_input)?;
    let input_query = args.input_query.input_query()?;

    // TODO: modify the try_from to Into<&str> so this can be just `&query`
    let query = Query::try_from(input_query.as_str())?;

    let result = query.apply(input_json)?;

    args.output.write_value(&result, &args.output_format)?;

    Ok(())
}
