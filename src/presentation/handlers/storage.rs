use crate::{
    context::Context,
    domain::{Query, QueryResult},
    presentation::error::{AppError, HttpResult},
};
use anyhow::Context as AnyhowContext;
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

pub async fn get_hash_storage(
    State(ctx): State<Context>, Path(id): Path<String>, Extension(cache): Extension<CacheHashStorageResponse>,
) -> HttpResult<Json<GetHashStorageResponse>> {
    if let Some(cached) = cache.get(&id).await {
        return Ok(Json(cached));
    }

    let batch = ctx.storage.retrieve(&id).await.context("An error occurrued when retrieving data from storage")?;

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
pub struct SearchDocumentsRequest {
    query: Query,
}

#[derive(Serialize)]
pub struct SearchDocumentsResponse {
    docs: QueryResult,
}

pub async fn search_documents(
    State(ctx): State<Context>, Json(payload): Json<SearchDocumentsRequest>,
) -> HttpResult<Json<SearchDocumentsResponse>> {
    let docs = ctx.storage.search(&payload.query).await.context("An error ocurrued when processing query")?;
    Ok(Json(SearchDocumentsResponse { docs }))
}
