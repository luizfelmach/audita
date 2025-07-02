use crate::domain::Query;
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
    async fn store(&self, docs: &Vec<DocumentStorable>) -> Result<()>;
    async fn retrieve_by_id(&self, id: &String) -> Result<Option<Vec<DocumentStorable>>>;
    async fn search(&self, query: &Query) -> Result<Vec<DocumentStorable>>;
}

pub trait DocumentHasher {
    fn digest(&self, docs: &Vec<Document>) -> Result<[u8; 32]>;
}
