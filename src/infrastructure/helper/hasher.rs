use anyhow::Result;
use sha2::{Digest as ShaDigest, Sha256};

use crate::domain::{Digest, Document, DocumentHasher};

#[derive(Clone)]
pub struct Sha256DocumentHasherHelper;

impl DocumentHasher for Sha256DocumentHasherHelper {
    fn digest(&self, item: &Document) -> Result<Digest> {
        let json_bytes = serde_json::to_vec(item)?;
        let hash = Sha256::digest(&json_bytes);
        Ok(Digest::from_slice(hash.as_slice()))
    }

    fn digest_batch(&self, items: &Vec<Document>) -> Result<Digest> {
        let mut acc = Vec::new();
        for doc in items {
            let doc_digest = self.digest(doc)?;
            let mut concat = acc.clone();
            concat.extend_from_slice(&doc_digest.0);
            let new_hash = Sha256::digest(&concat);
            acc = new_hash.to_vec();
        }
        Ok(Digest::from_slice(acc.as_slice()))
    }
}
