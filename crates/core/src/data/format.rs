use std::{io, string::FromUtf8Error};

use crate::{data::DataType, format::Indentation};
use colored_json::ColoredFormatter;
use serde::Serialize;
use serde_json::{
    ser::{CompactFormatter, Formatter, PrettyFormatter},
    Serializer, Value,
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("error while formatting json: {0}")]
    Json(#[from] serde_json::Error),

    #[error("error while formatting yaml: {0}")]
    Yaml(#[from] serde_yaml::Error),

    #[error("IO error while formatting: {0}")]
    Io(#[from] io::Error),

    #[error("error while creating String from UTF-8 bytes: {0}")]
    FromUtf8(#[from] FromUtf8Error),
}

pub type Result<T> = std::result::Result<T, Error>;

impl DataType {
    pub fn pretty_format(&self, value: &Value, indentation: Indentation) -> Result<String> {
        let mut buf = Vec::new();
        self.pretty_format_to_writer(&mut buf, value, indentation)?;
        Ok(String::from_utf8(buf)?)
    }

    pub fn pretty_format_to_writer<W: io::Write>(
        &self,
        writer: &mut W,
        value: &Value,
        indentation: Indentation,
    ) -> Result<()> {
        match self {
            DataType::Json => serialize_json(writer, value, indentation),
            // TODO: pretty yaml is not supported
            DataType::Yaml => Ok(serde_yaml::to_writer(writer, value)?),
        }
    }
}

impl DataType {
    pub fn pretty_format_colored(&self, value: &Value, indentation: Indentation) -> Result<String> {
        let mut buf = Vec::new();
        self.pretty_format_colored_to_writer(&mut buf, value, indentation)?;
        Ok(String::from_utf8(buf)?)
    }

    pub fn pretty_format_colored_to_writer<W: io::Write>(
        &self,
        writer: &mut W,
        value: &Value,
        indentation: Indentation,
    ) -> Result<()> {
        match self {
            DataType::Json => serialize_colored_json(value, writer, indentation),
            // TODO: colored yaml is not supported
            DataType::Yaml => Ok(serde_yaml::to_writer(writer, value)?),
        }
    }
}

fn serialize_json<W: io::Write>(
    writer: &mut W,
    value: &Value,
    indentation: Indentation,
) -> Result<()> {
    match indentation {
        Indentation::None => {
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
) -> Result<()> {
    let indentation_fmt = indentation.to_string();
    match indentation {
        Indentation::None => {
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
) -> Result<()> {
    let mut serializer = Serializer::with_formatter(writer, formatter);
    Ok(value.serialize(&mut serializer)?)
}
