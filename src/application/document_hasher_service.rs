use anyhow::Result;

use crate::domain::{Digest, Document, DocumentHasher};

#[derive(Clone)]
pub struct DocumentHasherService<H: DocumentHasher> {
    hasher: H,
}

impl<H: DocumentHasher> DocumentHasherService<H> {
    pub fn new(hasher: H) -> Self {
        Self { hasher }
    }

    pub fn hash_documents(&self, docs: &Vec<Document>) -> Result<Digest> {
        self.hasher.digest_batch(docs)
    }
}
