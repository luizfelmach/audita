use std::sync::Arc;

use crate::{
    batch::Batch,
    entity::Storable,
    error::{AppError, Result},
    state::AppState,
    storage::{search::QueryExpr, Storage},
};
use anyhow::Context;
use axum::{
    extract::{Path, State},
    Extension, Json,
};
use moka::future::Cache;
use serde::{Deserialize, Serialize};

pub type CacheHashStorageResponse = Arc<Cache<String, GetHashStorageResponse>>;

#[derive(Serialize, Clone)]
pub struct GetHashStorageResponse {
    id: String,
    count: usize,
    hash: String,
}

pub async fn handle_get_hash_storage(
    State(state): State<AppState>, Path(batch_id): Path<String>, Extension(cache): Extension<CacheHashStorageResponse>,
) -> Result<Json<GetHashStorageResponse>> {
    if let Some(cached) = cache.get(&batch_id).await {
        return Ok(Json(cached));
    }

    let results = state.storage.retrieve(batch_id.as_str()).await.context("An error occurrued when retrieving data from storage")?;

    if results.is_empty() {
        return Err(AppError::NotFound("No records found for the given batch_id".into()));
    }

    let mut batch = Batch::new();
    results.iter().try_for_each(|item| batch.add(&item.doc)).context("Error while computing the batch hash from the document contents")?;
    let response = GetHashStorageResponse { id: batch_id.clone(), count: batch.count, hash: batch.hash.to_hex() };
    cache.insert(batch_id, response.clone()).await;

    Ok(Json(response))
}

#[derive(Deserialize)]
pub struct SearchDocsRequest {
    query: QueryExpr,
}

#[derive(Serialize)]
pub struct SearchDocsResponse {
    docs: Vec<Storable>,
}

pub async fn handle_search_docs(State(state): State<AppState>, Json(payload): Json<SearchDocsRequest>) -> Result<Json<SearchDocsResponse>> {
    let docs = state.storage.search(payload.query).await.context("An error ocurrued when processing query")?;
    Ok(Json(SearchDocsResponse { docs }))
}
