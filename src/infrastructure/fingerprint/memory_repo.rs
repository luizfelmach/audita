use anyhow::{bail, Result};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use crate::domain::{Fingerprint, FingerprintRepository};

#[derive(Default, Clone)]
pub struct MemoryFingerprintRepository {
    store: Arc<RwLock<HashMap<String, Fingerprint>>>,
}

impl MemoryFingerprintRepository {
    pub fn new() -> Self {
        Self { store: Arc::new(RwLock::new(HashMap::new())) }
    }
}

impl FingerprintRepository for MemoryFingerprintRepository {
    async fn submit(&self, fingerprint: &Fingerprint) -> Result<[u8; 32]> {
        match self.store.write() {
            Ok(mut store) => {
                store.insert(fingerprint.id.clone(), fingerprint.clone());
                Ok([0u8; 32])
            }
            Err(err) => bail!("failed to acquire write lock on fingerprint store: {}", err),
        }
    }

    async fn confirm(&self, tx: &[u8; 32]) -> Result<[u8; 32]> {
        Ok(*tx)
    }

    async fn find_by_id(&self, id: &String) -> Result<Option<Fingerprint>> {
        match self.store.read() {
            Ok(store) => Ok(store.get(id).cloned()),
            Err(err) => bail!("failed to acquire write lock on fingerprint find_by_id: {}", err),
        }
    }
}
