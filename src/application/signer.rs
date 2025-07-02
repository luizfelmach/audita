use crate::domain::{Batch, SignerRepository};
use anyhow::Result;

#[derive(Clone)]
pub struct SignerService<R: SignerRepository> {
    repository: R,
}

impl<R: SignerRepository> SignerService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn submit(&self, batches: &Vec<Batch>) -> Result<()> {
        self.repository.publish(batches).await
    }

    pub async fn digest(&self, id: &String) -> Result<Option<[u8; 32]>> {
        self.repository.digest(id).await
    }
}
