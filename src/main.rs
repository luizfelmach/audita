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

use std::sync::Arc;

#[tokio::main]
async fn main() {
    setup::log();

    let state = setup::state();

    tokio::select! {
        () = task::processor(Arc::clone(&state)) =>{} ,
        () = task::signer(Arc::clone(&state)) => {},
        () = task::storage(Arc::clone(&state)) =>  {},
        () = task::server(Arc::clone(&state)) => {},
    }
}
