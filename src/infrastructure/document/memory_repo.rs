use crate::domain::{DocumentRepository, DocumentStorable, Query};
use anyhow::Result;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

#[derive(Default, Clone)]
pub struct MemoryDocumentRepository {
    store: Arc<RwLock<HashMap<String, Vec<DocumentStorable>>>>,
}

impl MemoryDocumentRepository {
    pub fn new() -> Self {
        Self { store: Arc::new(RwLock::new(HashMap::new())) }
    }
}

impl DocumentRepository for MemoryDocumentRepository {
    async fn store(&self, items: &Vec<DocumentStorable>) -> Result<()> {
        let mut storage = self.store.write().unwrap();
        for item in items {
            storage.entry(item.id.clone()).or_default().push(item.clone());
        }
        Ok(())
    }

    async fn retrieve_many(&self, id: String) -> Result<Vec<DocumentStorable>> {
        let storage = self.store.read().unwrap();
        Ok(storage.get(&id).cloned().unwrap_or_default())
    }

    async fn search(&self, _query: Query) -> Result<Vec<DocumentStorable>> {
        let storage = self.store.read().unwrap();
        Ok(storage.values().flat_map(|docs| docs.clone()).collect())
    }
}
