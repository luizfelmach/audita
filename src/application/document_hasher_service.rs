use crate::domain::{Document, DocumentHasher};
use anyhow::Result;

#[derive(Clone)]
pub struct DocumentHasherService<H: DocumentHasher> {
    hasher: H,
}

impl<H: DocumentHasher> DocumentHasherService<H> {
    pub fn new(hasher: H) -> Self {
        Self { hasher }
    }

    pub fn digest(&self, docs: &Vec<Document>) -> Result<[u8; 32]> {
        self.hasher.digest(docs)
    }
}
