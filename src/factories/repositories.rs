use crate::{
    config::AppConfig,
    domain::{DynHasher, DynSignerRepository, DynStorageRepository},
    infra::{signer::EthereumSignerRepository, storage::ElasticsearchStorageRepository},
    state::AppState,
};
use anyhow::Result;
use std::sync::Arc;

pub fn make_signer_repository(config: &AppConfig, state: &AppState) -> Result<DynSignerRepository> {
    let ethereum = &config.ethereum;

    let contract = match &state.contract {
        Some(address) => address.clone(),
        None => EthereumSignerRepository::deploy_contract(ethereum.url.clone(), ethereum.private_key.clone())?,
    };

    let _ = AppState::save_contract(contract.clone())?;

    let signer = EthereumSignerRepository::new(ethereum.url.clone(), contract, ethereum.private_key.clone(), ethereum.max_tx_pending)?;

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
