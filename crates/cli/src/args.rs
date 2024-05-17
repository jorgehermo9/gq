use clap::Parser;
use clap_verbosity_flag::Verbosity;
use clio::{Input, Output};

pub use self::indentation::IndentationArgs;
pub use self::input_query::InputQueryArgs;

mod indentation;
mod input_query;

/// Simple program to greet a person
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[clap(name = "gq")]
pub struct Args {
    /// JSON Input file, use '-' for stdin
    #[clap(long, short, value_parser, default_value = "-")]
    pub input: Input,

    /// JSON Output file '-' for stdout
    #[clap(long, short, value_parser, default_value = "-")]
    pub output: Output,

    #[clap(flatten)]
    pub query_group: InputQueryArgs,

    #[clap(flatten)]
    pub indentation: IndentationArgs,

    /// Verbosity level
    #[command(flatten)]
    pub verbose: Verbosity,
}
