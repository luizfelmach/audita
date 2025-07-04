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

use crate::{config::AppConfig, state::AppState};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let config = AppConfig::init().expect("Failed to load configuration");
    let state = AppState::init(config.clone()).expect("Failed to setup state");

    tokio::select! {
        _ = task::processor(state.clone()) => {},
        _ = task::signer(state.clone()) => {},
        _ = task::storage(state.clone()) => {},
        _ = task::server(state.clone()) => {},
    }
}
