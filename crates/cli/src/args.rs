use clap::builder::{
    styling::{AnsiColor, Effects},
    Styles,
};
use clap::{command, Parser};
use clap_verbosity_flag::Verbosity;

pub use self::input_query::InputQueryArgs;
use self::{input_data::InputDataArgs, output_args::OutputArgs};

pub mod input_data;
pub mod input_query;
pub mod output_args;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
#[command(styles = Styles::styled()
    .header(AnsiColor::Yellow.on_default() | Effects::BOLD)
    .usage(AnsiColor::Yellow.on_default() | Effects::BOLD)
    .literal(AnsiColor::Green.on_default()))]
#[clap(name = "gq")]
pub struct Args {
    #[clap(flatten)]
    pub input_data: InputDataArgs,

    #[clap(flatten)]
    pub input_query: InputQueryArgs,

    #[clap(flatten)]
    pub output_args: OutputArgs,

    /// Verbosity level
    #[command(flatten)]
    pub verbose: Verbosity,
}
