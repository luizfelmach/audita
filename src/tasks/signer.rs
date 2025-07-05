use crate::{context::Context, domain::Batch};
use std::sync::Arc;

pub async fn run(ctx: Arc<Context>) {
    while let Some(batch) = ctx.pipeline.signer.recv().await {
        send(ctx.clone(), batch).await;
    }
}

async fn send(ctx: Arc<Context>, batch: Arc<Batch>) {
    match ctx.signer.publish(&batch).await {
        Ok(_) => println!("batch completed on signer ({})", batch.id),
        Err(err) => eprintln!("Failed to submit batch: {:?}", err),
    }
}
