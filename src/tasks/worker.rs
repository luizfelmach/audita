use crate::domain::{Batch, Document, DynHasher, DynUuidGenerator, Pipeline};
use std::sync::Arc;

#[derive(Clone)]
pub struct WorkerTask {
    pipeline: Pipeline,
    hasher: DynHasher,
    uuid: DynUuidGenerator,
    batch_size: usize,
}

impl WorkerTask {
    pub fn new(pipeline: Pipeline, hasher: DynHasher, uuid: DynUuidGenerator, batch_size: usize) -> Self {
        Self { pipeline, hasher, uuid, batch_size }
    }

    pub async fn run(&self) {
        let mut buffer = Vec::new();

        while let Some(document) = self.pipeline.worker.recv().await {
            buffer.push(document);

            if buffer.len() >= self.batch_size {
                self.send(&mut buffer).await;
            }
        }
    }

    async fn send(&self, buffer: &mut Vec<Document>) {
        let id = self.uuid.generate();
        let digest = self.hasher.digest(&buffer).unwrap();
        let batch = Arc::new(Batch { id, documents: std::mem::take(buffer), digest });

        self.pipeline.signer.send(batch.clone()).await;
        self.pipeline.storage.send(batch.clone()).await;
    }
}
