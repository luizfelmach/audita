use crate::{
    application::{SignerService, StorageService},
    config::AppConfig,
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
    let config = AppConfig::new()?;
    let elastic = config.elastic;
    let hasher = Arc::new(Sha256HasherHelper::new());
    let storage = ElasticsearchStorageRepository::new(elastic.url, elastic.username, elastic.password, elastic.indices_pattern, hasher)?;
    Ok(StorageService::new(storage))
}

fn make_signer_service() -> Result<SignerService<EthereumSignerRepository>> {
    let config = AppConfig::new()?;
    let ethereum = config.ethereum;
    let signer = EthereumSignerRepository::new(ethereum.url, ethereum.contract, ethereum.private_key, ethereum.max_tx_pending)?;
    Ok(SignerService::new(signer))
}
