use tracing::{error, info, instrument, warn};

use crate::{context::Context, domain::Batch};
use std::sync::Arc;

pub async fn run(ctx: Arc<Context>) {
    while let Some(batch) = ctx.pipeline.storage.recv().await {
        send(ctx.clone(), batch).await;
    }
    warn!("Storage worker shutting down: channel closed");
}

#[instrument(skip(ctx, batch), fields(batch_id = %batch.id))]
async fn send(ctx: Arc<Context>, batch: Arc<Batch>) {
    match ctx.storage.store(&batch).await {
        Ok(_) => info!("Batch successfully stored"),
        Err(err) => error!(error = ?err, "Failed to store batch"),
    }
}
