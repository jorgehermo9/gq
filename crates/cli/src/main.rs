use anyhow::Result;
use clap::Parser;
use gq_cli::args::Args;
use gq_core::query::Query;
use std::io::{BufReader, BufWriter};
/// Simple program to greet a person

fn main() -> Result<()> {
    let args = Args::parse();

    env_logger::Builder::new()
        .filter_level(args.verbose.log_level_filter())
        .init();

    let json_input = BufReader::new(args.input);
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
