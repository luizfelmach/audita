use crate::{
    domain::{Document, Query, QueryResult},
    error::{AppError, Result},
    state::AppState,
};
use anyhow::Context;
use axum::{
    extract::{Path, State},
    Extension, Json,
};
use moka::future::Cache;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

pub type CacheHashStorageResponse = Arc<Cache<String, GetHashStorageResponse>>;

#[derive(Serialize, Clone)]
pub struct GetHashStorageResponse {
    id: String,
    hash: String,
}

pub async fn handle_get_hash_storage(
    State(state): State<AppState>, Path(id): Path<String>, Extension(cache): Extension<CacheHashStorageResponse>,
) -> Result<Json<GetHashStorageResponse>> {
    if let Some(cached) = cache.get(&id).await {
        return Ok(Json(cached));
    }

    let batch = state.services.storage.retrieve(&id).await.context("An error occurrued when retrieving data from storage")?;

    match batch {
        Some(batch) => {
            let response = GetHashStorageResponse { id: id.clone(), hash: hex::encode(batch.digest) };
            cache.insert(id, response.clone()).await;
            Ok(Json(response))
        }
        None => Err(AppError::NotFound("No records found for the given batch_id".into())),
    }
}

#[derive(Deserialize)]
pub struct SearchDocsRequest {
    query: Query,
}

#[derive(Serialize)]
pub struct SearchDocsResponse {
    docs: QueryResult,
}

pub async fn handle_search_docs(State(state): State<AppState>, Json(payload): Json<SearchDocsRequest>) -> Result<Json<SearchDocsResponse>> {
    let docs = state.services.storage.search(&payload.query).await.context("An error ocurrued when processing query")?;
    Ok(Json(SearchDocsResponse { docs }))
}
