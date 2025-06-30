use crate::{handlers::doc::handle_rx_doc, state::AppState};
use axum::{routing::post, Router};

pub fn routes() -> Router<AppState> {
    Router::new().route("/", post(handle_rx_doc))
}
