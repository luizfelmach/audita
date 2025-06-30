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

    pub fn store_documents(&self, docs: &Vec<DocumentStorable>) -> Result<()> {
        self.repository.store(docs)
    }

    pub fn get_documents_by_id(&self, id: String) -> Result<Vec<DocumentStorable>> {
        self.repository.retrieve_many(id)
    }

    pub fn search_documents(&self, query: Query) -> Result<Vec<DocumentStorable>> {
        self.repository.search(query)
    }
}
