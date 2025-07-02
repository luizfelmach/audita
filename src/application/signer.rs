use crate::domain::{Fingerprint, FingerprintRepository};
use anyhow::Result;

#[derive(Clone)]
pub struct SignerService<R: FingerprintRepository> {
    repository: R,
}

impl<R: FingerprintRepository> SignerService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn submit(&self, fingerprint: &Fingerprint) -> Result<[u8; 32]> {
        self.repository.submit(fingerprint).await
    }

    pub async fn confirm(&self, tx: &[u8; 32]) -> Result<[u8; 32]> {
        self.repository.confirm(tx).await
    }

    pub async fn find_by_id(&self, id: &String) -> Result<Option<Fingerprint>> {
        self.repository.find_by_id(id).await
    }
}
