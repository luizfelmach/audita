use anyhow::Result;
use config::{Config, Environment, File};
use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub queue_capacity: usize,
    pub batch_threshold: usize,
    pub chain_threshold: usize,
    pub ethereum: EthereumConfig,
    pub elastic: ElasticConfig,
}

#[derive(Clone, Debug, Deserialize)]
pub struct EthereumConfig {
    pub url: String,
    pub contract: String,
    pub private_key: String,
    pub disable: bool,
}

#[derive(Clone, Debug, Deserialize)]
pub struct ElasticConfig {
    pub url: String,
    pub username: String,
    pub password: String,
    pub disable: bool,
}

impl AppConfig {
    pub fn new() -> Result<Self> {
        let cfg = Config::builder()
            .add_source(File::with_name("/etc/audita/config.toml").required(false))
            .add_source(File::with_name("config.toml").required(false))
            .add_source(File::with_name("config/dev.toml").required(false))
            .add_source(Environment::with_prefix("AUDITA").separator("__"))
            .build()?;
        Ok(cfg.try_deserialize()?)
    }
}
