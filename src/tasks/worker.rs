use crate::{
    context::Context,
    domain::{Batch, Document},
};
use std::sync::Arc;

pub async fn run(ctx: Arc<Context>) {
    let mut buffer = Vec::new();

    while let Some(document) = ctx.pipeline.worker.recv().await {
        buffer.push(document);

        if buffer.len() >= ctx.config.batch_size {
            send(ctx.clone(), &mut buffer).await;
        }
    }
}

async fn send(ctx: Arc<Context>, buffer: &mut Vec<Document>) {
    let id = ctx.uuid.generate();
    let digest = ctx.hasher.digest(&buffer).unwrap();
    let batch = Arc::new(Batch { id, documents: std::mem::take(buffer), digest });

    ctx.pipeline.signer.send(batch.clone()).await;
    ctx.pipeline.storage.send(batch.clone()).await;
}
