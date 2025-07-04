use crate::{
    application::Services,
    channel::{self, RxChannel, TxChannel},
    config::AppConfig,
};
use anyhow::Result;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub tx: TxChannel,
    pub rx: RxChannel,
    pub services: Services,
    pub config: Arc<AppConfig>,
}

impl AppState {
    pub fn init(config: Arc<AppConfig>) -> Result<Arc<Self>> {
        let services = Services::init(config.clone())?;
        let (tx, rx) = channel::init(config.queue_size);
        Ok(Arc::new(AppState { tx, rx, services, config }))
    }
}
