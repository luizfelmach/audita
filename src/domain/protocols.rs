use crate::domain::{Batch, Document, Query, QueryResult};
use anyhow::Result;
use async_trait::async_trait;
use std::sync::Arc;

#[async_trait]
pub trait SignerRepository: Send + Sync {
    async fn publish(&self, batch: &Batch) -> Result<()>;
    async fn digest(&self, id: &String) -> Result<Option<[u8; 32]>>;
}

#[async_trait]
pub trait StorageRepository: Send + Sync {
    async fn store(&self, batch: &Batch) -> Result<()>;
    async fn retrieve(&self, id: &String) -> Result<Option<Batch>>;
    async fn search(&self, query: &Query) -> Result<QueryResult>;
}

#[async_trait]
pub trait Channel<T>: Send + Sync {
    async fn send(&self, item: T);
    async fn recv(&self) -> Option<T>;
}

pub trait Hasher: Send + Sync {
    fn digest(&self, docs: &Vec<Document>) -> Result<[u8; 32]>;
}

pub trait UuidGenerator: Send + Sync {
    fn generate(&self) -> String;
}

pub type DynSignerRepository = Arc<dyn SignerRepository>;
pub type DynStorageRepository = Arc<dyn StorageRepository>;
pub type DynChannel<T> = Arc<dyn Channel<T>>;
pub type DynHasher = Arc<dyn Hasher>;
pub type DynUuidGenerator = Arc<dyn UuidGenerator>;
