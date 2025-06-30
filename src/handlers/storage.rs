use std::sync::Arc;

use crate::{
    domain::{Document, DocumentStorable, Query},
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

pub type CacheHashStorageResponse = Arc<Cache<String, GetHashStorageResponse>>;

#[derive(Serialize, Clone)]
pub struct GetHashStorageResponse {
    id: String,
    hash: String,
}

pub async fn handle_get_hash_storage(
    State(state): State<AppState>, Path(batch_id): Path<String>, Extension(cache): Extension<CacheHashStorageResponse>,
) -> Result<Json<GetHashStorageResponse>> {
    if let Some(cached) = cache.get(&batch_id).await {
        return Ok(Json(cached));
    }

    let results =
        state.services.document.get_documents_by_id(batch_id.clone()).context("An error occurrued when retrieving data from storage")?;
    if results.is_empty() {
        return Err(AppError::NotFound("No records found for the given batch_id".into()));
    }

    let docs = results.iter().map(|item| item.doc.clone()).collect::<Vec<Document>>();

    let digest =
        state.services.document_hasher.hash_documents(&docs).context("Error while computing the batch hash from the document contents")?;

    let response = GetHashStorageResponse { id: batch_id.clone(), hash: digest.to_hex() };
    cache.insert(batch_id, response.clone()).await;

    Ok(Json(response))
}

#[derive(Deserialize)]
pub struct SearchDocsRequest {
    query: Query,
}

#[derive(Serialize)]
pub struct SearchDocsResponse {
    docs: Vec<DocumentStorable>,
}

pub async fn handle_search_docs(State(state): State<AppState>, Json(payload): Json<SearchDocsRequest>) -> Result<Json<SearchDocsResponse>> {
    let docs = state.services.document.search_documents(payload.query).context("An error ocurrued when processing query")?;
    Ok(Json(SearchDocsResponse { docs }))
}
