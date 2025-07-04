use crate::{
    application::{SignerService, StorageService},
    config::CONFIG,
    infra::{helper::Sha256HasherHelper, signer::EthereumSignerRepository, storage::ElasticsearchStorageRepository},
};
use anyhow::Result;
use std::sync::Arc;

#[derive(Clone)]
pub struct Services {
    pub storage: StorageService<ElasticsearchStorageRepository>,
    pub signer: SignerService<EthereumSignerRepository>,
}

impl Services {
    pub fn init() -> Result<Self> {
        Ok(Self { storage: make_storage_service()?, signer: make_signer_service()? })
    }
}

fn make_storage_service() -> Result<StorageService<ElasticsearchStorageRepository>> {
    let elastic = &CONFIG.elastic;
    let hasher = Arc::new(Sha256HasherHelper::new());
    let storage = ElasticsearchStorageRepository::new(
        elastic.url.clone(),
        elastic.username.clone(),
        elastic.password.clone(),
        elastic.indices_pattern.clone(),
        hasher,
    )?;
    Ok(StorageService::new(storage))
}

fn make_signer_service() -> Result<SignerService<EthereumSignerRepository>> {
    let ethereum = &CONFIG.ethereum;
    let signer = EthereumSignerRepository::new(
        ethereum.url.clone(),
        ethereum.contract.clone(),
        ethereum.private_key.clone(),
        ethereum.max_tx_pending,
    )?;
    Ok(SignerService::new(signer))
}
