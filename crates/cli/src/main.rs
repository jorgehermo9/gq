use anyhow::Result;
use clap::Parser;
use gq_cli::args::Args;
use gq_core::{
    format::{PrettyFormat, PrettyFormatColored},
    query::Query,
};
use std::io::{BufReader, BufWriter, Write};
/// Simple program to greet a person

fn main() -> Result<()> {
    let args = Args::parse();

    env_logger::Builder::new()
        .filter_level(args.verbose.log_level_filter())
        .init();

    let json_input = BufReader::new(args.input);

    // TODO: remove this type annotation
    let json_input = serde_json::from_reader(json_input)?;

    let input_query = args.query_group.input_query()?;

    // TODO: modify the try_from to Into<&str> so this can be just `&query`
    let query = Query::try_from(input_query.as_str())?;

    let result = query.apply(json_input)?;

    let indentation = &args.output_format.indentation();

    let is_tty = args.output.is_tty();
    let mut output = BufWriter::new(args.output);
    if is_tty {
        result.pretty_format_colored_to_writer(&mut output, indentation)?;
        output.write_all(b"\n")?;
    } else {
        result.pretty_format_to_writer(&mut output, indentation)?
    };

    Ok(())
}
