use crate::{
    error::{AppError, Result},
    state::AppState,
};
use axum::{
    extract::{Path, State},
    Json,
};
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct GetHashBlochainResponse {
    id: String,
    hash: String,
}

pub async fn get_hash_blockchain(State(state): State<AppState>, Path(id): Path<String>) -> Result<Json<GetHashBlochainResponse>> {
    match state.services.signer.digest(&id).await? {
        Some(digest) => Ok(Json(GetHashBlochainResponse { id, hash: hex::encode(digest) })),
        None => Err(AppError::NotFound("No records found for the given batch_id".into())),
    }
}
