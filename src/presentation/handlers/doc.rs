use crate::{domain::Document, error::Result, state::AppState};
use anyhow::Context;
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct RxDocRequest(Document);

pub async fn handle_rx_doc(State(state): State<AppState>, Json(payload): Json<RxDocRequest>) -> Result<()> {
    state.tx.processor.send(payload.0).await.context("Failed to enqueue message")?;
    Ok(())
}
