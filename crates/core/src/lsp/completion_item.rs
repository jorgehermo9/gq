use derive_builder::Builder;
use rowan::TextRange;

#[derive(Clone, Builder)]
#[builder(pattern = "owned",setter(strip_option))]
pub struct CompletionItem {
    /// Label in the completion pop up which identifies completion.
    pub label: String,
    pub completion: String,
    /// Additional label details in the completion pop up that are
    /// displayed and aligned on the right side after the label.
    #[builder(default)]
    pub label_detail: Option<String>,
    /// Range of identifier that is being completed.
    ///
    /// It should be used primarily for UI, but we also use this to convert
    /// generic TextEdit into LSP's completion edit (see conv.rs).
    ///
    /// `source_range` must contain the completion offset. `text_edit` should
    /// start with what `source_range` points to, or VSCode will filter out the
    /// completion silently.
    pub source_range: TextRange,
    /// Additional info to show in the UI pop up.
    #[builder(default)]
    pub detail: Option<String>,
    #[builder(default)]
    pub documentation: Option<String>,
}
