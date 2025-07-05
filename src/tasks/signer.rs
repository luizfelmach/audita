use crate::{context::Context, domain::Batch};
use std::sync::Arc;
use tracing::{error, info, instrument, warn};

pub async fn run(ctx: Arc<Context>) {
    while let Some(batch) = ctx.pipeline.signer.recv().await {
        ctx.prom.signer_queue_size.dec();
        let start = std::time::Instant::now();
        send(ctx.clone(), batch).await;
        ctx.prom.signer_request_latency.observe(start.elapsed().as_secs_f64());
    }
    warn!("Signer worker shutting down: channel closed");
}

#[instrument(skip(ctx, batch), fields(batch_id = %batch.id))]
async fn send(ctx: Arc<Context>, batch: Arc<Batch>) {
    match ctx.signer.publish(&batch).await {
        Ok(_) => info!("Batch successfully published by signer"),
        Err(err) => {
            ctx.prom.signer_errors_total.inc();
            error!(error = ?err, "Failed to publish batch");
        }
    }
}
