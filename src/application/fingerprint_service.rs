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

    pub fn submit(&self, fingerprint: Fingerprint) -> Result<Digest> {
        self.repository.submit_fingerprint(fingerprint)
    }

    pub fn confirm(&self, tx: Digest) -> Result<Digest> {
        self.repository.confirm_transaction(tx)
    }

    pub fn find(&self, id: String) -> Result<Fingerprint> {
        self.repository.find_by_id(id)
    }
}
