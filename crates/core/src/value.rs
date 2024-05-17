use std::{io, string::FromUtf8Error};

use serde::Serialize;
use serde_json::{ser::PrettyFormatter, Serializer, Value};

use crate::format::{self, Indentation, PrettyFormat};

impl PrettyFormat for Value {
    fn pretty_format(&self, indentation: &Indentation) -> Result<String, format::Error> {
        let mut buf = Vec::new();
        self.pretty_format_to_writer(&mut buf, indentation)?;
        Ok(String::from_utf8(buf)?)
    }

    fn pretty_format_to_writer<W: io::Write>(
        &self,
        writer: W,
        indentation: &Indentation,
    ) -> Result<(), format::Error> {
        if let Indentation::Inline = indentation {
            return Ok(serde_json::to_writer(writer, self)?);
        }
        let indentation_fmt = indentation.to_string();
        let formatter = PrettyFormatter::with_indent(indentation_fmt.as_bytes());
        let mut serializer = Serializer::with_formatter(writer, formatter);
        Ok(self.serialize(&mut serializer)?)
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
