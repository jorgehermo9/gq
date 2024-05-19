use std::io::{BufWriter, Write};

use clio::Output;
use gq_core::format::{self, PrettyFormat, PrettyFormatColored};
use serde_json::Value;

use crate::args::output_format::{Colored, OutputFormatArgs};

pub trait WriteValue {
    fn write_value(self, value: &Value, output_format: &OutputFormatArgs) -> format::Result<()>;
}

impl WriteValue for Output {
    fn write_value(self, value: &Value, output_format: &OutputFormatArgs) -> format::Result<()> {
        let colored = &output_format.colored;
        let indentation = &output_format.indentation();
        let is_tty = self.is_tty();
        let mut buf_writer = BufWriter::new(self);

        match colored {
            Colored::Auto => {
                if is_tty {
                    value.pretty_format_colored_to_writer(&mut buf_writer, indentation)?
                } else {
                    value.pretty_format_to_writer(&mut buf_writer, indentation)?
                }
            }
            Colored::Always => {
                value.pretty_format_colored_to_writer(&mut buf_writer, indentation)?
            }
            Colored::Never => value.pretty_format_to_writer(&mut buf_writer, indentation)?,
        };

        if is_tty {
            buf_writer.write_all(b"\n")?
        };
        Ok(())
    }
}
