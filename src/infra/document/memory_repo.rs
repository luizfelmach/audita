use crate::domain::{DocumentRepository, DocumentStorable, Query};
use anyhow::{bail, Result};
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
    async fn store(&self, docs: &Vec<DocumentStorable>) -> Result<()> {
        match self.store.write() {
            Ok(mut store) => {
                for item in docs {
                    store.entry(item.id.clone()).or_default().push(item.clone());
                }
                Ok(())
            }
            Err(err) => bail!("failed to acquire write lock on document store: {}", err),
        }
    }

    async fn retrieve_by_id(&self, id: &String) -> Result<Option<Vec<DocumentStorable>>> {
        match self.store.read() {
            Ok(store) => match store.get(id).cloned() {
                Some(item) => Ok(Some(item)),
                None => Ok(None),
            },
            Err(err) => bail!("failed to acquire write lock on document retrieve_by_id: {}", err),
        }
    }

    async fn search(&self, _query: &Query) -> Result<Vec<DocumentStorable>> {
        match self.store.read() {
            Ok(store) => Ok(store.values().flat_map(|docs| docs.clone()).collect()),
            Err(err) => bail!("failed to acquire write lock on document search: {}", err),
        }
    }
}
