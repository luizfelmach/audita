mod application;
mod channel;
mod config;
mod domain;
mod error;
mod handlers;
mod infrastructure;
mod routes;
mod setup;
mod state;
mod task;

#[tokio::main]
async fn main() {
    setup::logger();

    let state = setup::state();

    tokio::select! {
        _ = task::processor(state.clone()) => {},
        _ = task::signer(state.clone()) => {},
        _ = task::storage(state.clone()) => {},
        _ = task::server(state.clone()) => {},
    }
}
