use std::{
    fmt::{self, Display, Formatter},
    io,
};

use thiserror::Error;

use crate::format::Indentation;

use super::{ChildQuery, Query};

#[derive(Debug, Error)]
pub enum Error {
    #[error("IO error while formatting: {0}")]
    Io(#[from] io::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

// TODO: implement pretty print with operators
impl Query {
    // TODO: do a test for this function, so parsing a formatted query, outputs the
    // same original query...
    pub fn pretty_format(&self, indentation: Indentation) -> String {
        let mut result = String::new();

        let arguments = self.arguments();
        if !arguments.0.is_empty() {
            result.push_str(&format!("({arguments})"));
        }
        let key = self.key();
        if !key.keys().is_empty() {
            if self.children().is_empty() {
                result.push_str(&key.to_string());
                return result;
            }
            result.push_str(&format!("{key} "));
        } else if self.children().is_empty() {
            result.push_str("{ }");
            return result;
        }

        result.push_str(&format!("{{{}", indentation.level_separator()));
        for child in self.children() {
            child.do_pretty_format(&mut result, indentation, 1);
        }
        result.push('}');

        result
    }

    pub fn pretty_format_to_writer<W: io::Write>(
        &self,
        writer: &mut W,
        indentation: Indentation,
    ) -> Result<()> {
        let formatted = self.pretty_format(indentation);
        Ok(writer.write_all(formatted.as_bytes())?)
    }
}

// TODO: implement pretty print with operators
impl ChildQuery {
    fn do_pretty_format(&self, result: &mut String, indentation: Indentation, level: usize) {
        let indent_string = indentation.at_level(level);
        let sep = indentation.level_separator();

        let query_key = self.key();

        result.push_str(&format!("{indent_string}{query_key}"));
        if let Some(alias) = self.alias() {
            result.push_str(&format!(": {alias}"));
        }

        if !self.children().is_empty() {
            result.push_str(&format!(" {{{sep}"));
            for child in self.children() {
                child.do_pretty_format(result, indentation, level + 1);
            }
            result.push_str(&format!("{indent_string}}}{sep}"));
        } else {
            result.push(sep);
        }
    }
}

impl Display for Query {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        let formatted = self.pretty_format(Default::default());
        formatted.fmt(f)
    }
}
