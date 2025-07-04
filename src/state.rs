use crate::{
    application::Services,
    channel::{self, RxChannel, TxChannel},
    config::AppConfig,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub tx: TxChannel,
    pub rx: RxChannel,
    pub services: Services,
}

impl AppState {
    pub fn new() -> Arc<Self> {
        let config = AppConfig::new().expect("Failed to load config");
        let services = Services::init().expect("Failed to load services");
        let (tx, rx) = channel::new(config.queue_size);

        Arc::new(AppState { config, tx, rx, services })
    }
}
