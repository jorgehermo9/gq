use gq_core::format::Indentation;

#[derive(Debug, clap::Args)]
pub struct OutputFormatArgs {
    #[clap(flatten)]
    pub indentation: IndentationArgs,
    /// Compact output
    #[clap(long, conflicts_with_all = &["indent", "tab"])]
    pub compact: bool,

    // Colorize output JSON
    #[clap(long, default_value = "auto")]
    pub colored: Colored,
}

impl OutputFormatArgs {
    pub fn indentation(&self) -> Indentation {
        if self.compact {
            Indentation::Inline
        } else {
            self.indentation.indentation()
        }
    }
}

#[derive(Debug, clap::Args)]
pub struct IndentationArgs {
    /// Use tabs for indentation
    #[clap(long)]
    tab: bool,
    /// Number of spaces or tabs to use for indentation
    #[clap(long, default_value_t = 2)]
    indent: usize,
}

impl IndentationArgs {
    pub fn indentation(&self) -> Indentation {
        if self.tab {
            Indentation::with_tabs(self.indent)
        } else {
            Indentation::with_spaces(self.indent)
        }
    }
}

#[derive(Debug, Clone, clap::ValueEnum)]
pub enum Colored {
    Auto,
    Always,
    Never,
}
