use crate::{
    context::Context,
    presentation::error::{AppError, HttpResult},
};
use axum::{
    extract::{Path, State},
    Json,
};
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct GetHashSignerResponse {
    id: String,
    hash: String,
}

pub async fn get_hash_signer(State(ctx): State<Context>, Path(id): Path<String>) -> HttpResult<Json<GetHashSignerResponse>> {
    match ctx.signer.digest(&id).await? {
        Some(digest) => Ok(Json(GetHashSignerResponse { id, hash: hex::encode(digest) })),
        None => Err(AppError::NotFound("No records found for the given batch_id".into())),
    }
}
