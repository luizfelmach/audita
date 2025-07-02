use crate::domain::{Batch, Document, Query, QueryResult};
use anyhow::Result;

pub trait SignerRepository {
    async fn publish(&self, batches: &Vec<Batch>) -> Result<()>;
    async fn digest(&self, id: &String) -> Result<Option<[u8; 32]>>;
}

pub trait StorageRepository {
    async fn store(&self, batch: &Batch) -> Result<()>;
    async fn retrieve(&self, id: &String) -> Result<Option<Batch>>;
    async fn search(&self, query: &Query) -> Result<QueryResult>;
}

pub trait Hasher: Send + Sync {
    fn digest(&self, docs: &Vec<Document>) -> Result<[u8; 32]>;
}
