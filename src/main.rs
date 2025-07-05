mod config;
mod context;
mod domain;
mod factories;
mod infra;
mod presentation;
mod tasks;

use crate::context::Context;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let ctx = Context::init().unwrap();

    for _ in 0..10 {
        let ctx = ctx.clone();
        tokio::spawn(tasks::worker::run(ctx));
    }

    for _ in 0..10 {
        let ctx = ctx.clone();
        tokio::spawn(tasks::signer::run(ctx));
    }

    for _ in 0..10 {
        let ctx = ctx.clone();
        tokio::spawn(tasks::storage::run(ctx));
    }
}
