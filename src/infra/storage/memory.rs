use crate::domain::{Batch, DocumentQuery, Hasher, Query, QueryResult, StorageRepository};
use anyhow::Result;
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct MemoryStorageRepository {
    store: Arc<RwLock<HashMap<String, Batch>>>,
    _hasher: Arc<dyn Hasher>,
}

impl MemoryStorageRepository {
    pub fn new(hasher: Arc<dyn Hasher>) -> Self {
        Self { store: Arc::new(RwLock::new(HashMap::new())), _hasher: hasher }
    }
}

#[async_trait]
impl StorageRepository for MemoryStorageRepository {
    async fn store(&self, batch: &Batch) -> Result<()> {
        self.store.write().await.insert(batch.id.clone(), batch.clone());
        Ok(())
    }

    async fn retrieve(&self, id: &String) -> Result<Option<Batch>> {
        Ok(self.store.read().await.get(id).cloned())
    }

    async fn search(&self, _query: &Query) -> Result<QueryResult> {
        let store = self.store.read().await;
        let mut result = Vec::new();
        for batch in store.values() {
            for doc in &batch.documents {
                result.push(DocumentQuery { id: batch.id.clone(), source: doc.clone() });
            }
        }
        Ok(result)
    }
}
