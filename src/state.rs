use crate::{
    application::Services,
    channel::{RxChannel, TxChannel},
    config::AppConfig,
};

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub tx: TxChannel,
    pub rx: RxChannel,
    pub services: Services,
}
