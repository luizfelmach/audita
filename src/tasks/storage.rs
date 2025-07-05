use tracing::{error, info, instrument, warn};

use crate::{context::Context, domain::Batch};
use std::sync::Arc;

pub async fn run(ctx: Arc<Context>) {
    while let Some(batch) = ctx.pipeline.storage.recv().await {
        ctx.prom.storage_queue_size.dec();
        let start = std::time::Instant::now();
        send(ctx.clone(), batch).await;
        ctx.prom.storage_request_latency.observe(start.elapsed().as_secs_f64());
    }
    warn!("Storage worker shutting down: channel closed");
}

#[instrument(skip(ctx, batch), fields(batch_id = %batch.id))]
async fn send(ctx: Arc<Context>, batch: Arc<Batch>) {
    match ctx.storage.store(&batch).await {
        Ok(_) => info!("Batch successfully stored"),
        Err(err) => {
            ctx.prom.storage_errors_total.inc();
            error!(error = ?err, "Failed to store batch");
        }
    }
}
