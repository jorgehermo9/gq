use std::{
    fmt::{self, Display, Formatter},
    io,
    num::NonZeroUsize,
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Unexpected error while formatting: {0}")]
    Unexpected(Box<dyn std::error::Error + Send + Sync>),
    #[error("Unexpected IO error while formatting: {0}")]
    Io(#[from] io::Error),
}

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

pub trait PrettyFormat {
    fn pretty_format(&self, indentation: &Indentation) -> Result<String, Error>;
    fn pretty_format_to_writer<W: io::Write>(
        &self,
        writer: W,
        indentation: &Indentation,
    ) -> Result<(), Error>;
}
