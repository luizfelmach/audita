use crate::{context::Context, domain::Batch};
use std::sync::Arc;
use tracing::{error, info, instrument, warn};

pub async fn run(ctx: Arc<Context>) {
    while let Some(batch) = ctx.pipeline.signer.recv().await {
        send(ctx.clone(), batch).await;
    }
    warn!("Signer worker shutting down: channel closed");
}

#[instrument(skip(ctx, batch), fields(batch_id = %batch.id))]
async fn send(ctx: Arc<Context>, batch: Arc<Batch>) {
    match ctx.signer.publish(&batch).await {
        Ok(_) => info!("Batch successfully published by signer"),
        Err(err) => error!(error = ?err, "Failed to publish batch"),
    }
}
