use std::env;
use tracing::debug;

pub fn logger() {
    let level = env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string());

    env::set_var("RUST_LOG", format!("{},alloy=error,hyper=error,reqwest=error,axum=error", level));
    tracing_subscriber::fmt::init();

    debug!(LOG_LEVEL = level);
}
