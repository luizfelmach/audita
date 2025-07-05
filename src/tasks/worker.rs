use tracing::{debug, error, instrument, warn};

use crate::{
    context::Context,
    domain::{Batch, Document},
};
use std::sync::Arc;

pub async fn run(ctx: Arc<Context>) {
    let mut buffer = Vec::new();

    while let Some(document) = ctx.pipeline.worker.recv().await {
        ctx.prom.worker_queue_size.dec();
        debug!("Received document for batching");
        buffer.push(document);

        if buffer.len() >= ctx.config.batch_size {
            let start = std::time::Instant::now();
            send(ctx.clone(), &mut buffer).await;
            ctx.prom.batch_processing_latency.observe(start.elapsed().as_secs_f64());
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
            ctx.prom.batches_error_total.inc();
            error!(?err, "Failed to compute digest");
            return;
        }
    };

    let batch = Arc::new(Batch { id, documents: std::mem::take(buffer), digest });
    debug!(batch_id = %batch.id, count = batch.documents.len(), "Sending batch to signer and storage");

    ctx.pipeline.signer.send(batch.clone()).await;
    ctx.pipeline.storage.send(batch.clone()).await;

    ctx.prom.signer_queue_size.inc();
    ctx.prom.storage_queue_size.inc();
    ctx.prom.batches_total.inc();
}
