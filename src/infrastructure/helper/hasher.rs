use crate::domain::{Digest, Document, DocumentHasher};
use anyhow::Result;
use sha2::{Digest as ShaDigest, Sha256};

#[derive(Clone)]
pub struct Sha256DocumentHasherHelper;

impl DocumentHasher for Sha256DocumentHasherHelper {
    fn digest_batch(&self, items: &Vec<Document>) -> Result<Digest> {
        let mut acc = String::new();
        for doc in items {
            let json_string = serde_json::to_string(doc)?;
            let combined = format!("{}{}", acc, json_string);
            let hash = Sha256::digest(combined.as_bytes());
            acc = format!("{:x}", hash);
        }
        let final_hash = Sha256::digest(acc.as_bytes());
        Ok(Digest::from_slice(final_hash.as_slice()))
    }
}
