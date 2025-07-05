use crate::{context::Context, presentation::handlers::metrics::get_metrics};
use axum::{routing::get, Router};

pub fn routes() -> Router<Context> {
    Router::new().route("/", get(get_metrics))
}
