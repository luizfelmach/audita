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

#[tokio::main]
async fn main() {
    setup::log();

    let state = setup::state();

    tokio::select! {
        () = task::processor(state.clone()) =>{} ,
        () = task::signer(state.clone()) => {},
        () = task::storage(state.clone()) =>  {},
        () = task::server(state.clone()) => {},
    }
}
