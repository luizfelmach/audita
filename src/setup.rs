use std::{env, sync::Arc};
use tracing::debug;

use crate::{application::Services, channel, config::AppConfig, state::AppState};

pub fn logger() {
    let level = env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string());

    env::set_var("RUST_LOG", format!("{},alloy=error,hyper=error,reqwest=error,axum=error", level));
    tracing_subscriber::fmt::init();

    debug!(LOG_LEVEL = level);
}

pub fn state() -> Arc<AppState> {
    let config = AppConfig::new().expect("Failed to load config");
    let services = Services::new();
    let (tx, rx) = channel::new(config.queue_capacity);

    Arc::new(AppState { config, tx, rx, services })
}
