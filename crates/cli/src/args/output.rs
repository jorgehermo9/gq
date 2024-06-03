use std::io::{BufWriter, Write};

use clap::{Args, ColorChoice, ValueEnum};
use gq_core::data::{format, DataType};
use serde_json::Value;

use self::output_format::OutputFormat;

pub mod output_format;

#[derive(Debug, Clone, ValueEnum)]
pub enum OutputType {
    Match,
    Json,
    Yaml,
}

impl OutputType {
    pub fn into_data_type(self, original_data_type: DataType) -> DataType {
        match self {
            OutputType::Match => original_data_type,
            OutputType::Json => DataType::Json,
            OutputType::Yaml => DataType::Yaml,
        }
    }
}

#[derive(Debug, Args)]
pub struct Output {
    /// JSON Output file,use  '-' for stdout
    #[clap(long, short, value_parser, default_value = "-")]
    pub output: clio::Output,
    #[clap(long, default_value_t = OutputType::Match)]
    #[arg(value_enum)]
    pub output_type: OutputType,
    #[clap(flatten)]
    pub output_format: OutputFormat,
}

impl Output {
    pub fn write_value(self, value: &Value, original_type: DataType) -> format::Result<()> {
        let color = &self.output_format.color;
        let indentation = self.output_format.indentation();
        let output_type = self.output_type.into_data_type(original_type);
        let is_tty = self.output.is_tty();
        let mut buf_writer = BufWriter::new(self.output);

        match color {
            ColorChoice::Auto => {
                if is_tty {
                    output_type.pretty_format_colored_to_writer(
                        &mut buf_writer,
                        value,
                        indentation,
                    )?
                } else {
                    output_type.pretty_format_to_writer(&mut buf_writer, value, indentation)?
                }
            }
            ColorChoice::Always => {
                output_type.pretty_format_colored_to_writer(&mut buf_writer, value, indentation)?
            }
            ColorChoice::Never => {
                output_type.pretty_format_to_writer(&mut buf_writer, value, indentation)?
            }
        };

        if is_tty {
            buf_writer.write_all(b"\n")?
        };
        Ok(())
    }
}
