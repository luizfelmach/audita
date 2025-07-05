use crate::domain::{Document, Hasher};
use anyhow::Result;
use sha2::{Digest, Sha256};

#[derive(Clone)]
pub struct Sha256HasherHelper;

impl Hasher for Sha256HasherHelper {
    fn digest(&self, docs: &Vec<Document>) -> Result<[u8; 32]> {
        let mut partial = String::new();
        for doc in docs {
            let json = serde_json::to_string(doc)?;
            let combined = format!("{}{}", partial, json);
            let hash = Sha256::digest(combined.as_bytes());
            partial = format!("{:x}", hash);
        }
        Ok(Sha256::digest(partial.as_bytes()).into())
    }
}
