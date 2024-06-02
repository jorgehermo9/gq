use std::{
    fmt::{self, Display, Formatter},
    num::NonZeroUsize,
};
#[derive(Debug, Clone, Copy)]
pub enum Indentation {
    Spaces(NonZeroUsize),
    Tabs(NonZeroUsize),
    // TODO: rename into Indentation::Compact? Indentation::None?
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

impl Default for Indentation {
    fn default() -> Self {
        Self::Spaces(NonZeroUsize::new(2).unwrap())
    }
}
