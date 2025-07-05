use crate::domain::{Batch, SignerRepository};
use anyhow::Result;
use async_trait::async_trait;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct MemorySignerRepository {
    digests: Arc<RwLock<HashMap<String, [u8; 32]>>>,
}

impl MemorySignerRepository {
    pub fn new() -> Self {
        Self { digests: Arc::new(RwLock::new(HashMap::new())) }
    }
}

#[async_trait]
impl SignerRepository for MemorySignerRepository {
    async fn publish(&self, batch: &Batch) -> Result<()> {
        let mut digests = self.digests.write().await;
        digests.insert(batch.id.clone(), batch.digest);
        Ok(())
    }

    async fn digest(&self, id: &String) -> Result<Option<[u8; 32]>> {
        Ok(self.digests.read().await.get(id).cloned())
    }
}
