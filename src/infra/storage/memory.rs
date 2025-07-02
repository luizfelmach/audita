use crate::domain::{Batch, DocumentQuery, Hasher, Query, QueryResult, StorageRepository};
use anyhow::Result;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct MemoryStorageRepository {
    store: RwLock<HashMap<String, Batch>>,
    hasher: Arc<dyn Hasher>,
}

impl Clone for MemoryStorageRepository {
    fn clone(&self) -> Self {
        Self { store: RwLock::new(HashMap::new()), hasher: Arc::clone(&self.hasher) }
    }
}

impl MemoryStorageRepository {
    pub fn new(hasher: Arc<dyn Hasher>) -> Self {
        Self { store: RwLock::new(HashMap::new()), hasher }
    }
}

impl StorageRepository for MemoryStorageRepository {
    async fn store(&self, batch: &Batch) -> Result<()> {
        self.store.write().await.insert(batch.id.clone(), batch.clone()).unwrap();
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
