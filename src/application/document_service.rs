use crate::domain::{DocumentRepository, DocumentStorable, Query};
use anyhow::Result;

#[derive(Clone)]
pub struct DocumentService<R: DocumentRepository> {
    repository: R,
}

impl<R: DocumentRepository> DocumentService<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn store_documents(&self, docs: &Vec<DocumentStorable>) -> Result<()> {
        self.repository.store(docs).await
    }

    pub async fn get_documents_by_id(&self, id: String) -> Result<Vec<DocumentStorable>> {
        self.repository.retrieve_many(id).await
    }

    pub async fn search_documents(&self, query: Query) -> Result<Vec<DocumentStorable>> {
        self.repository.search(query).await
    }
}
