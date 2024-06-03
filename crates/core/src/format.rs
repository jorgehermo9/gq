use std::{
    fmt::{self, Display, Formatter},
    num::NonZeroUsize,
};
#[derive(Debug, Clone, Copy)]
pub enum Indentation {
    Spaces(NonZeroUsize),
    Tabs(NonZeroUsize),
    None,
}

impl Indentation {
    pub fn symbol(&self) -> &str {
        match self {
            Self::Spaces(_) => " ",
            Self::Tabs(_) => "\t",
            Self::None => "",
        }
    }

    pub fn level_separator(&self) -> char {
        match self {
            Self::Spaces(_) | Self::Tabs(_) => '\n',
            Self::None => ' ',
        }
    }

    pub fn at_level(&self, level: usize) -> String {
        self.to_string().repeat(level)
    }

    pub fn with_spaces(n: usize) -> Self {
        match n {
            0 => Self::None,
            n => Self::Spaces(NonZeroUsize::new(n).unwrap()),
        }
    }

    pub fn with_tabs(n: usize) -> Self {
        match n {
            0 => Self::None,
            n => Self::Tabs(NonZeroUsize::new(n).unwrap()),
        }
    }
}

impl Display for Indentation {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Indentation::Spaces(n) | Indentation::Tabs(n) => self.symbol().repeat(n.get()).fmt(f),
            Indentation::None => Ok(()),
        }
    }
}

impl Default for Indentation {
    fn default() -> Self {
        Self::Spaces(NonZeroUsize::new(2).unwrap())
    }
}
