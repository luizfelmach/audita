use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fingerprint {
    pub id: String,
    pub hash: [u8; 32],
}

pub trait FingerprintRepository {
    async fn submit(&self, fingerprint: &Fingerprint) -> Result<[u8; 32]>;
    async fn confirm(&self, tx: &[u8; 32]) -> Result<[u8; 32]>;
    async fn find_by_id(&self, id: &String) -> Result<Option<Fingerprint>>;
}
