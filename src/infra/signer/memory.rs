use crate::domain::{Batch, SignerRepository};
use anyhow::Result;
use std::collections::HashMap;
use tokio::sync::RwLock;

pub struct MemorySignerRepository {
    digests: RwLock<HashMap<String, [u8; 32]>>,
}

impl Clone for MemorySignerRepository {
    fn clone(&self) -> Self {
        Self { digests: RwLock::new(HashMap::new()) }
    }
}

impl MemorySignerRepository {
    pub fn new() -> Self {
        Self { digests: RwLock::new(HashMap::new()) }
    }
}

impl SignerRepository for MemorySignerRepository {
    async fn publish(&self, batches: &Vec<Batch>) -> Result<()> {
        let mut digests = self.digests.write().await;
        for batch in batches {
            digests.insert(batch.id.clone(), batch.digest);
        }
        Ok(())
    }

    async fn digest(&self, id: &String) -> Result<Option<[u8; 32]>> {
        Ok(self.digests.read().await.get(id).cloned())
    }
}
