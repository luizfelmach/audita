mod application;
mod channel;
mod config;
mod domain;
mod error;
mod handlers;
mod infrastructure;
mod prometheus;
mod routes;
mod setup;
mod state;
mod task;

use state::AppState;
use std::sync::Arc;
use tracing::{debug, info, warn};

fn main() {
    setup::log();

    info!("starting application");

    let state = setup::state();
    let runtime = setup::runtime(state.config.threads);

    runtime.block_on(app(state));
}

async fn app(state: Arc<AppState>) {
    debug!("starting tasks: worker, ethereum, elastic, and server");

    tokio::select! {
        () = task::processor(Arc::clone(&state)) => warn!("processor task exited unexpectedly"),
        () = task::signer(Arc::clone(&state)) => warn!("signer task exited unexpectedly"),
        () = task::storage(Arc::clone(&state)) => warn!("storage task exited unexpectedly"),
        () = task::server(Arc::clone(&state)) => warn!("server task exited unexpectedly"),
    }

    warn!("shutting down application")
}
