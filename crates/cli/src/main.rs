use anyhow::Result;
use clap::Parser;
use gq_cli::args::Args;
use gq_core::{data::Data, query::Query};
use serde_json::Value;

fn main() -> Result<()> {
    let args = Args::parse();

    env_logger::Builder::new()
        .filter_level(args.verbose.log_level_filter())
        .init();

    let input_data = Data::try_from(args.input_data)?;
    let input_query = String::try_from(args.input_query)?;

    let query = Query::try_from(input_query.as_str())?;

    let value = Value::try_from(&input_data)?;
    let result = query.apply(value)?;

    args.output.write_value(&result, *input_data.data_type())?;

    Ok(())
}
