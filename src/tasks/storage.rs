use crate::{context::Context, domain::Batch};
use std::sync::Arc;

pub async fn run(ctx: Arc<Context>) {
    while let Some(batch) = ctx.pipeline.storage.recv().await {
        send(ctx.clone(), batch).await;
    }
}

async fn send(ctx: Arc<Context>, batch: Arc<Batch>) {
    match ctx.storage.store(&batch).await {
        Ok(_) => println!("batch completed on storage ({})", batch.id),
        Err(err) => eprintln!("Failed to submit batch: {:?}", err),
    }
}
