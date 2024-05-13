use std::{
    fmt::{self, Display, Formatter},
    num::NonZeroUsize,
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Unexpected error while formatting: {0}")]
    Unexpected(Box<dyn std::error::Error>),
}

pub enum Indentation {
    Spaces(NonZeroUsize),
    Tabs(NonZeroUsize),
    Inline,
}

impl Indentation {
    pub fn symbol(&self) -> &str {
        match self {
            Indentation::Spaces(_) => " ",
            Indentation::Tabs(_) => "\t",
            Indentation::Inline => "",
        }
    }

    pub fn level_separator(&self) -> char {
        match self {
            Indentation::Spaces(_) | Indentation::Tabs(_) => '\n',
            Indentation::Inline => ' ',
        }
    }

    pub fn at_level(&self, level: usize) -> String {
        self.to_string().repeat(level)
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
}
