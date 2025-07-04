mod application;
mod channel;
mod config;
mod domain;
mod error;
mod handlers;
mod infra;
mod routes;
mod state;
mod task;

use crate::state::AppState;
use tracing::{debug, error};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = match AppState::init() {
        Ok(state) => state,
        Err(err) => {
            error!("Failed to initialize application state. Reason: {}", err);
            std::process::exit(1);
        }
    };

    debug!(?state.config);

    tokio::select! {
        _ = task::processor(state.clone()) => {},
        _ = task::signer(state.clone()) => {},
        _ = task::storage(state.clone()) => {},
        _ = task::server(state.clone()) => {},
    }
}
