use crate::{context::Context, domain::Document, presentation::error::HttpResult};
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct SubmitDocumentRequest(Document);

pub async fn submit_document(State(ctx): State<Context>, Json(payload): Json<SubmitDocumentRequest>) -> HttpResult<()> {
    ctx.prom.docs_total.inc();
    ctx.prom.worker_queue_size.inc();
    ctx.pipeline.worker.send(payload.0).await;
    Ok(())
}
