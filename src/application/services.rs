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
    pub fn init(config: Arc<AppConfig>) -> Result<Self> {
        let storage = make_storage_service(config.clone())?;
        let signer = make_signer_service(config.clone())?;
        Ok(Self { storage, signer })
    }
}

fn make_storage_service(config: Arc<AppConfig>) -> Result<StorageService<ElasticsearchStorageRepository>> {
    let elastic = &config.elastic;
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

fn make_signer_service(config: Arc<AppConfig>) -> Result<SignerService<EthereumSignerRepository>> {
    let ethereum = &config.ethereum;
    let signer = EthereumSignerRepository::new(
        ethereum.url.clone(),
        ethereum.contract.clone(),
        ethereum.private_key.clone(),
        ethereum.max_tx_pending,
    )?;
    Ok(SignerService::new(signer))
}
