use anyhow::{anyhow, Result};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use crate::domain::{Digest, Fingerprint, FingerprintRepository};

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
    fn submit_fingerprint(&self, fp: Fingerprint) -> Result<Digest> {
        let mut storage = self.store.write().unwrap();
        storage.insert(fp.id.clone(), fp.clone());
        Ok(fp.hash)
    }

    fn confirm_transaction(&self, tx: Digest) -> Result<Digest> {
        Ok(tx)
    }

    fn find_by_id(&self, id: String) -> Result<Fingerprint> {
        let storage = self.store.read().unwrap();
        storage.get(&id).cloned().ok_or_else(|| anyhow!("Fingerprint not found: {}", id))
    }
}
