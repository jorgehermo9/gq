use std::string::FromUtf8Error;

use serde::Serialize;
use serde_json::{Serializer, Value};

use crate::format::{self, Indentation, PrettyFormat};

impl PrettyFormat for Value {
    fn pretty_format(&self, indentation: &Indentation) -> Result<String, format::Error> {
        let mut buf = Vec::new();
        let indentation_fmt = indentation.to_string();
        let formatter = serde_json::ser::PrettyFormatter::with_indent(indentation_fmt.as_bytes());
        let mut serializer = Serializer::with_formatter(&mut buf, formatter);
        self.serialize(&mut serializer)?;
        Ok(String::from_utf8(buf)?)
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
