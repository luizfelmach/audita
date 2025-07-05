use crate::{
    context::Context,
    presentation::handlers::storage::{get_hash_storage, search_documents, CacheHashStorageResponse},
};
use axum::{
    routing::{get, post},
    Extension, Router,
};
use moka::future::Cache;
use std::{sync::Arc, time::Duration};

pub fn routes() -> Router<Context> {
    let cache = Cache::builder().time_to_live(Duration::from_secs(60)).max_capacity(1000).build();
    let cache: CacheHashStorageResponse = Arc::new(cache);

    Router::new().route("/search", post(search_documents)).route("/hash/{id}", get(get_hash_storage)).layer(Extension(cache))
}
