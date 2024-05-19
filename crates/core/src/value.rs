use std::{io, string::FromUtf8Error};

use serde_json::{ser::PrettyFormatter, Value};
use colored_json::{ColorMode, ColoredFormatter, CompactFormatter};

use crate::format::{self, Indentation, PrettyFormat};

impl PrettyFormat for Value {
    fn pretty_format(&self, indentation: &Indentation, colored: bool) -> format::Result<String> {
        let mut buf = Vec::new();
        self.pretty_format_to_writer(&mut buf, indentation, colored)?;
        Ok(String::from_utf8(buf)?)
    }

    fn pretty_format_to_writer<W: io::Write>(
        &self,
        mut writer: W,
        indentation: &Indentation,
        colored: bool
    ) -> format::Result<()> { 
        let color_mode = if colored { ColorMode::On } else { ColorMode::Off };
        if let Indentation::Inline = indentation {
            let formatter: ColoredFormatter<CompactFormatter> = ColoredFormatter::new(CompactFormatter);
            return Ok(formatter.write_colored_json(self, &mut writer, color_mode)?);
        }
        let indentation_fmt = indentation.to_string();
        let formatter: ColoredFormatter<PrettyFormatter> = ColoredFormatter::new(PrettyFormatter::with_indent(indentation_fmt.as_bytes()));
        Ok(formatter.write_colored_json(self, &mut writer, color_mode)?)
    }
}

impl From<serde_json::Error> for format::Error {
    fn from(error: serde_json::Error) -> Self {
        format::Error::Unexpected(Box::new(error))
    }
}

impl From<FromUtf8Error> for format::Error {
    fn from(error: FromUtf8Error) -> Self {
        format::Error::Unexpected(Box::new(error))
    }
}
