use crate::{
    application::Services,
    channel::{self, RxChannel, TxChannel},
};
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub tx: TxChannel,
    pub rx: RxChannel,
    pub services: Services,
}

impl AppState {
    pub fn new() -> Arc<Self> {
        let services = Services::init().expect("Failed to load services");
        let (tx, rx) = channel::init();
        Arc::new(AppState { tx, rx, services })
    }
}
