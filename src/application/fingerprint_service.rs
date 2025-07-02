use crate::domain::{Digest, Fingerprint, FingerprintRepository};
use anyhow::Result;

#[derive(Clone)]
pub struct FingerprintService<R: FingerprintRepository> {
    repository: R,
}

impl<R: FingerprintRepository> FingerprintService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn submit(&self, fingerprint: Fingerprint) -> Result<Digest> {
        self.repository.submit_fingerprint(fingerprint).await
    }

    pub async fn confirm(&self, tx: Digest) -> Result<Digest> {
        self.repository.confirm_transaction(tx).await
    }

    pub async fn find(&self, id: String) -> Result<Option<Fingerprint>> {
        self.repository.find_by_id(id).await
    }
}
