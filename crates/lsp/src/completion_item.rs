use derive_getters::Getters;

#[derive(Debug, Clone, Getters)]
pub struct CompletionItem {
    completion: String,
}

impl CompletionItem {
    pub fn new(completion: String) -> Self {
        Self { completion }
    }
}
