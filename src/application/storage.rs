use crate::domain::{DocumentRepository, DocumentStorable, Query};
use anyhow::Result;

#[derive(Clone)]
pub struct StorageService<R: DocumentRepository> {
    repository: R,
}

impl<R: DocumentRepository> StorageService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn store(&self, docs: &Vec<DocumentStorable>) -> Result<()> {
        self.repository.store(docs).await
    }

    pub async fn retrieve_by_id(&self, id: &String) -> Result<Option<Vec<DocumentStorable>>> {
        self.repository.retrieve_by_id(id).await
    }

    pub async fn search(&self, query: &Query) -> Result<Vec<DocumentStorable>> {
        self.repository.search(query).await
    }
}
