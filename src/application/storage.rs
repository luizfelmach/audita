use crate::domain::{Batch, Query, QueryResult, StorageRepository};
use anyhow::Result;

#[derive(Clone)]
pub struct StorageService<R: StorageRepository> {
    repository: R,
}

impl<R: StorageRepository> StorageService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn submit(&self, batch: &Batch) -> Result<()> {
        self.repository.store(batch).await
    }

    pub async fn retrieve(&self, id: &String) -> Result<Option<Batch>> {
        self.repository.retrieve(id).await
    }

    pub async fn search(&self, query: &Query) -> Result<QueryResult> {
        self.repository.search(query).await
    }
}
