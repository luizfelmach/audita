use crate::domain::{Digest, Query};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

pub type Document = Map<String, Value>;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentStorable {
    pub id: String,
    pub ord: usize,
    pub doc: Document,
}

pub trait DocumentRepository {
    async fn store(&self, items: &Vec<DocumentStorable>) -> Result<()>;
    async fn retrieve_many(&self, id: String) -> Result<Vec<DocumentStorable>>;
    async fn search(&self, query: Query) -> Result<Vec<DocumentStorable>>;
}

pub trait DocumentHasher {
    fn digest_batch(&self, items: &Vec<Document>) -> Result<Digest>;
}
