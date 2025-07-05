use crate::{
    config::AppConfig,
    domain::{DynHasher, DynSignerRepository, DynStorageRepository},
    infra::{signer::EthereumSignerRepository, storage::ElasticsearchStorageRepository},
};
use anyhow::Result;
use std::sync::Arc;

pub fn make_signer_repository(config: &AppConfig) -> Result<DynSignerRepository> {
    let ethereum = &config.ethereum;
    let signer = EthereumSignerRepository::new(
        ethereum.url.clone(),
        ethereum.contract.clone(),
        ethereum.private_key.clone(),
        ethereum.max_tx_pending,
    )?;
    Ok(Arc::new(signer))
}

pub fn make_storage_repository(config: &AppConfig, hasher: DynHasher) -> Result<DynStorageRepository> {
    let elastic = &config.elastic;
    let storage = ElasticsearchStorageRepository::new(
        elastic.url.clone(),
        elastic.username.clone(),
        elastic.password.clone(),
        elastic.indices_pattern.clone(),
        hasher,
    )?;
    Ok(Arc::new(storage))
}
