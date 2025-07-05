use crate::{context::Context, presentation::handlers::signer::get_hash_signer};
use axum::{routing::get, Router};

pub fn routes() -> Router<Context> {
    Router::new().route("/hash/{id}", get(get_hash_signer))
}
