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

pub async fn get_hash_blockchain(State(state): State<AppState>, Path(batch_id): Path<String>) -> Result<Json<GetHashBlochainResponse>> {
    match state.services.fingerprint.find(batch_id)? {
        Some(a) => Ok(Json(GetHashBlochainResponse { id: a.id, hash: a.hash.to_hex() })),
        None => Err(AppError::NotFound("No records found for the given batch_id".into())),
    }
}
