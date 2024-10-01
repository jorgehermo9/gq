use clap::{Args, ColorChoice};
use gq_core::data::Data;
#[derive(Debug, Args)]
pub struct OutputFormat {
    #[clap(flatten)]
    pub indentation: Indentation,

    /// Compact output (Currently only for JSON)
    #[clap(long, conflicts_with_all = &["indent", "tab"])]
    pub compact: bool,

    /// Colorize output (Currently only for JSON)
    #[clap(long, default_value_t = ColorChoice::Auto)]
    #[arg(value_enum)]
    pub color: ColorChoice,
}

impl OutputFormat {
    pub fn indentation(&self) -> gq_core::format::Indentation {
        if self.compact {
            gq_core::format::Indentation::None
        } else {
            self.indentation.indentation()
        }
    }
}

#[derive(Debug, Args)]
pub struct Indentation {
    /// Use tabs for indentation (Currently only for JSON)
    #[clap(long)]
    tab: bool,

    /// Number of spaces or tabs to use for indentation (Currently only for JSON)
    #[clap(long, default_value_t = 2)]
    indent: usize,
}

impl Indentation {
    pub fn indentation(&self) -> gq_core::format::Indentation {
        if self.tab {
            gq_core::format::Indentation::with_tabs(self.indent)
        } else {
            gq_core::format::Indentation::with_spaces(self.indent)
        }
    }
}
