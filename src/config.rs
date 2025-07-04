use anyhow::Result;
use config::{Config, Environment, File};
use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub queue_size: usize,
    pub batch_size: usize,
    pub ethereum: EthereumConfig,
    pub elastic: ElasticConfig,
}

#[derive(Clone, Debug, Deserialize)]
pub struct EthereumConfig {
    pub url: String,
    pub contract: String,
    pub private_key: String,
    pub max_tx_pending: usize,
}

#[derive(Clone, Debug, Deserialize)]
pub struct ElasticConfig {
    pub url: String,
    pub username: String,
    pub password: String,
    pub indices_pattern: String,
}

impl AppConfig {
    pub fn new() -> Result<Self> {
        let mut builder = Config::builder().add_source(File::with_name("/etc/audita/config.toml").required(false));
        if let Ok(home) = std::env::var("HOME") {
            builder = builder.add_source(File::with_name(&format!("{}/.config/audita/config.toml", home)).required(false));
        }
        let cfg = builder
            .add_source(File::with_name("config.toml").required(false))
            .add_source(File::with_name("config/dev.toml").required(false))
            .add_source(Environment::with_prefix("AUDITA"))
            .build()?;

        Ok(cfg.try_deserialize()?)
    }
}
