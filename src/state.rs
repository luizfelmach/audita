use crate::{
    application::Services,
    channel::{self, RxChannel, TxChannel},
    config::AppConfig,
};
use anyhow::Result;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub tx: Arc<TxChannel>,
    pub rx: Arc<RxChannel>,
    pub services: Arc<Services>,
    pub config: Arc<AppConfig>,
}

impl AppState {
    pub fn init() -> Result<Arc<Self>> {
        let config = AppConfig::init()?;
        let services = Services::init(&config)?;
        let (tx, rx) = channel::init(config.queue_size);

        Ok(Arc::new(AppState { tx: Arc::new(tx), rx: Arc::new(rx), services: Arc::new(services), config: Arc::new(config) }))
    }
}
