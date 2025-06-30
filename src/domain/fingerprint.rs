use crate::domain::digest::Digest;
use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Fingerprint {
    pub id: String,
    pub hash: Digest,
}

pub trait FingerprintRepository {
    fn submit_fingerprint(&self, fp: Fingerprint) -> Result<Digest>;
    fn confirm_transaction(&self, tx: Digest) -> Result<Digest>;
    fn find_by_id(&self, id: String) -> Result<Option<Fingerprint>>;
}
