mod config;
mod context;
mod domain;
mod factories;
mod infra;
mod presentation;
mod tasks;

use crate::{context::Context, presentation::server};
use tracing::{debug, error, info};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let ctx = Context::init().unwrap();

    debug!(?ctx.config);
    info!("Spawning background workers...");

    for _ in 0..100 {
        let ctx = ctx.clone();
        tokio::spawn(tasks::worker::run(ctx));
    }
    for _ in 0..100 {
        let ctx = ctx.clone();
        tokio::spawn(tasks::signer::run(ctx));
    }
    for _ in 0..100 {
        let ctx = ctx.clone();
        tokio::spawn(tasks::storage::run(ctx));
    }

    if let Err(err) = server::run(ctx.clone()).await {
        error!("Server failed to start: {}", err);
    }
}
