use crate::domain::digest::Digest;
use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fingerprint {
    pub id: String,
    pub hash: Digest,
}

pub trait FingerprintRepository {
    async fn submit_fingerprint(&self, fp: Fingerprint) -> Result<Digest>;
    async fn confirm_transaction(&self, tx: Digest) -> Result<Digest>;
    async fn find_by_id(&self, id: String) -> Result<Option<Fingerprint>>;
}
