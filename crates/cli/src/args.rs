use clap::builder::{
    styling::{AnsiColor, Effects},
    Styles,
};
use clap::{command, Parser};
use clap_verbosity_flag::Verbosity;

pub use self::input_query::InputQuery;
use self::{input_data::InputData, output::Output};

pub mod input_data;
pub mod input_query;
pub mod output;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[command(styles = Styles::styled()
    .header(AnsiColor::Yellow.on_default() | Effects::BOLD)
    .usage(AnsiColor::Yellow.on_default() | Effects::BOLD)
    .literal(AnsiColor::Green.on_default())
    .placeholder(AnsiColor::Blue.on_default()))]
#[clap(name = "gq")]
pub struct Args {
    #[clap(flatten)]
    pub input_data: InputData,

    #[clap(flatten)]
    pub input_query: InputQuery,

    #[clap(flatten)]
    pub output: Output,

    /// Verbosity level
    #[command(flatten)]
    pub verbose: Verbosity,
}
