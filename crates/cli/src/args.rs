use clap::builder::{styling, Styles};
use clap::{command, Parser};
use clap_verbosity_flag::Verbosity;
use clio::{Input, Output};

pub use self::input_query::InputQueryArgs;
pub use self::output_format::IndentationArgs;
use self::output_format::OutputFormatArgs;

pub mod input_query;
pub mod output_format;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[command(styles = Styles::styled()
    .header(styling::AnsiColor::Yellow.on_default() | styling::Effects::BOLD)
    .usage(styling::AnsiColor::Yellow.on_default() | styling::Effects::BOLD)
    .literal(styling::AnsiColor::Green.on_default()))]
#[clap(name = "gq")]
pub struct Args {
    /// JSON Input file, use '-' for stdin
    #[clap(long, short, value_parser, default_value = "-")]
    pub input: Input,

    /// JSON Output file '-' for stdout
    #[clap(long, short, value_parser, default_value = "-")]
    pub output: Output,

    #[clap(flatten)]
    pub input_query: InputQueryArgs,

    #[clap(flatten)]
    pub output_format: OutputFormatArgs,

    /// Verbosity level
    #[command(flatten)]
    pub verbose: Verbosity,
}
