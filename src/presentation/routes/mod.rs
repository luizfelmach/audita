pub mod document;
pub mod metrics;
pub mod signer;
pub mod storage;

use crate::context::Context;
use axum::{routing::get, Router};

pub fn api() -> Router<Context> {
    Router::new()
        .merge(document::routes())
        .nest("/signer", signer::routes())
        .nest("/storage", storage::routes())
        .nest("/metrics", metrics::routes())
        .route("/ping", get(ping))
}

async fn ping() -> &'static str {
    "pong"
}
