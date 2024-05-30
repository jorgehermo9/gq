use std::{
    fmt::{self, Display, Formatter},
    io,
    num::NonZeroUsize,
};
use thiserror::Error;

use crate::data::DataType;

mod value;
pub type Result<T> = std::result::Result<T, Error>;
#[derive(Error, Debug)]
pub enum Error {
    // TODO: Do not use box and use a custom error type
    #[error("Unexpected error while formatting: {0}")]
    Unexpected(Box<dyn std::error::Error + Send + Sync>),
    #[error("Unexpected IO error while formatting: {0}")]
    Io(#[from] io::Error),
}

// TODO: implement default for indentation, so it is not hardcoded Spaces(2)
#[derive(Debug, Clone, Copy)]
pub enum Indentation {
    Spaces(NonZeroUsize),
    Tabs(NonZeroUsize),
    Inline,
}

impl Indentation {
    pub fn symbol(&self) -> &str {
        match self {
            Self::Spaces(_) => " ",
            Self::Tabs(_) => "\t",
            Self::Inline => "",
        }
    }

    pub fn level_separator(&self) -> char {
        match self {
            Self::Spaces(_) | Self::Tabs(_) => '\n',
            Self::Inline => ' ',
        }
    }

    pub fn at_level(&self, level: usize) -> String {
        self.to_string().repeat(level)
    }

    pub fn with_spaces(n: usize) -> Self {
        match n {
            0 => Self::Inline,
            n => Self::Spaces(NonZeroUsize::new(n).unwrap()),
        }
    }

    pub fn with_tabs(n: usize) -> Self {
        match n {
            0 => Self::Inline,
            n => Self::Tabs(NonZeroUsize::new(n).unwrap()),
        }
    }
}

impl Display for Indentation {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Indentation::Spaces(n) | Indentation::Tabs(n) => self.symbol().repeat(n.get()).fmt(f),
            Indentation::Inline => Ok(()),
        }
    }
}

// TODO: have an alias for the format result`type Result<T> = std::result::Result<T, Error>;`
pub trait PrettyFormat {
    // TODO: return String or Data?
    fn pretty_format(&self, indentation: Indentation, output_type: DataType) -> Result<String>;
    fn pretty_format_to_writer<W: io::Write>(
        &self,
        writer: &mut W,
        // TODO: inver the order of indentation and output_type params
        indentation: Indentation,
        output_type: DataType,
    ) -> Result<()>;
}

pub trait PrettyFormatColored {
    fn pretty_format_colored(
        &self,
        indentation: Indentation,
        output_type: DataType,
    ) -> Result<String>;
    fn pretty_format_colored_to_writer<W: io::Write>(
        &self,
        writer: &mut W,
        indentation: Indentation,
        output_type: DataType,
    ) -> Result<()>;
}
