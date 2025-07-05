use tracing::{debug, error, instrument, warn};

use crate::{
    context::Context,
    domain::{Batch, Document},
};
use std::sync::Arc;

pub async fn run(ctx: Arc<Context>) {
    let mut buffer = Vec::new();

    while let Some(document) = ctx.pipeline.worker.recv().await {
        debug!("Received document for batching");
        buffer.push(document);

        if buffer.len() >= ctx.config.batch_size {
            send(ctx.clone(), &mut buffer).await;
        }
    }

    if !buffer.is_empty() {
        warn!("Final flush of remaining documents ({} docs)", buffer.len());
        send(ctx.clone(), &mut buffer).await;
    }

    warn!("Worker shutting down: channel closed");
}

#[instrument(skip(ctx, buffer))]
async fn send(ctx: Arc<Context>, buffer: &mut Vec<Document>) {
    let id = ctx.uuid.generate();
    let digest = match ctx.hasher.digest(&buffer) {
        Ok(d) => d,
        Err(err) => {
            error!(?err, "Failed to compute digest");
            return;
        }
    };

    let batch = Arc::new(Batch { id, documents: std::mem::take(buffer), digest });
    debug!(batch_id = %batch.id, count = batch.documents.len(), "Sending batch to signer and storage");

    ctx.pipeline.signer.send(batch.clone()).await;
    ctx.pipeline.storage.send(batch.clone()).await;
}
