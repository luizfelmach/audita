use crate::domain::{Batch, DynSignerRepository, Pipeline};
use std::sync::Arc;

#[derive(Clone)]
pub struct SignerTask {
    pipeline: Pipeline,
    repository: DynSignerRepository,
}

impl SignerTask {
    pub fn new(pipeline: Pipeline, repository: DynSignerRepository) -> Self {
        Self { pipeline, repository }
    }

    pub async fn run(&self) {
        while let Some(batch) = self.pipeline.signer.recv().await {
            self.send(batch).await;
        }
    }

    async fn send(&self, batch: Arc<Batch>) {
        match self.repository.publish(&batch).await {
            Ok(_) => println!("batch completed on signer ({})", batch.id),
            Err(err) => eprintln!("Failed to submit batch: {:?}", err),
        }
    }
}
