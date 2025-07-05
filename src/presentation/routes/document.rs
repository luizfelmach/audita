use crate::{context::Context, presentation::handlers::document::submit_document};
use axum::{routing::post, Router};

pub fn routes() -> Router<Context> {
    Router::new().route("/", post(submit_document))
}
