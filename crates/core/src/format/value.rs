use std::{io, string::FromUtf8Error};

use crate::{
    data::DataType,
    format::{self, Indentation, PrettyFormat},
};
use colored_json::ColoredFormatter;
use serde::Serialize;
use serde_json::{
    ser::{CompactFormatter, Formatter, PrettyFormatter},
    Serializer, Value,
};

use super::PrettyFormatColored;

impl PrettyFormat for Value {
    fn pretty_format(
        &self,
        indentation: Indentation,
        output_type: DataType,
    ) -> format::Result<String> {
        let mut buf = Vec::new();
        self.pretty_format_to_writer(&mut buf, indentation, output_type)?;
        Ok(String::from_utf8(buf)?)
    }

    fn pretty_format_to_writer<W: io::Write>(
        &self,
        writer: &mut W,
        indentation: Indentation,
        output_type: DataType,
    ) -> format::Result<()> {
        match output_type {
            DataType::Json => serialize_json(self, writer, indentation),
            // TODO: implement this
            DataType::Yaml => Ok(serde_yaml::to_writer(writer, self)?),
        }
    }
}

// TODO: the PrettyFormatColored should reuse the PrettyFormat trait.
// reduce code duplication, maybe we can factor out the ColoredFormatter thing
impl PrettyFormatColored for Value {
    fn pretty_format_colored(
        &self,
        indentation: Indentation,
        output_type: DataType,
    ) -> format::Result<String> {
        let mut buf = Vec::new();
        self.pretty_format_colored_to_writer(&mut buf, indentation, output_type)?;
        Ok(String::from_utf8(buf)?)
    }

    fn pretty_format_colored_to_writer<W: io::Write>(
        &self,
        writer: &mut W,
        indentation: Indentation,
        output_type: DataType,
    ) -> format::Result<()> {
        match output_type {
            DataType::Json => serialize_colored_json(self, writer, indentation),
            // TODO: implement this
            DataType::Yaml => Ok(serde_yaml::to_writer(writer, self)?),
        }
    }
}

fn serialize_json<W: io::Write>(
    value: &Value,
    writer: &mut W,
    indentation: Indentation,
) -> format::Result<()> {
    match indentation {
        Indentation::Inline => {
            let formatter = CompactFormatter {};
            serialize_json_with_formatter(value, writer, formatter)
        }
        Indentation::Spaces(_) | Indentation::Tabs(_) => {
            let indentation_fmt = indentation.to_string();
            let formatter = PrettyFormatter::with_indent(indentation_fmt.as_bytes());
            serialize_json_with_formatter(value, writer, formatter)
        }
    }
}

fn serialize_colored_json<W: io::Write>(
    value: &Value,
    writer: &mut W,
    indentation: Indentation,
) -> format::Result<()> {
    let indentation_fmt = indentation.to_string();
    match indentation {
        Indentation::Inline => {
            let formatter = ColoredFormatter::new(CompactFormatter {});
            serialize_json_with_formatter(value, writer, formatter)
        }
        Indentation::Spaces(_) | Indentation::Tabs(_) => {
            let formatter =
                ColoredFormatter::new(PrettyFormatter::with_indent(indentation_fmt.as_bytes()));
            serialize_json_with_formatter(value, writer, formatter)
        }
    }
}
fn serialize_json_with_formatter<W: io::Write, F: Formatter>(
    value: &Value,
    writer: &mut W,
    formatter: F,
) -> format::Result<()> {
    let mut serializer = Serializer::with_formatter(writer, formatter);
    Ok(value.serialize(&mut serializer)?)
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
impl From<serde_yaml::Error> for format::Error {
    fn from(error: serde_yaml::Error) -> Self {
        format::Error::Unexpected(Box::new(error))
    }
}
