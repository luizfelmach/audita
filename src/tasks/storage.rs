use crate::domain::{Batch, DynStorageRepository, Pipeline};
use std::sync::Arc;

#[derive(Clone)]
pub struct StorageTask {
    pipeline: Pipeline,
    repository: DynStorageRepository,
}

impl StorageTask {
    pub fn new(pipeline: Pipeline, repository: DynStorageRepository) -> Self {
        Self { pipeline, repository }
    }

    pub async fn run(&self) {
        while let Some(batch) = self.pipeline.storage.recv().await {
            self.send(batch).await;
        }
    }

    async fn send(&self, batch: Arc<Batch>) {
        match self.repository.store(&batch).await {
            Ok(_) => println!("batch completed on storage ({})", batch.id),
            Err(err) => eprintln!("Failed to submit batch: {:?}", err),
        }
    }
}
