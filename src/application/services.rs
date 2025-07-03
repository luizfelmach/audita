use crate::{
    application::{SignerService, StorageService},
    infra::{helper::Sha256HasherHelper, signer::EthereumSignerRepository, storage::ElasticsearchStorageRepository},
};
use std::sync::Arc;

#[derive(Clone)]
pub struct Services {
    pub storage: StorageService<ElasticsearchStorageRepository>,
    pub signer: SignerService<EthereumSignerRepository>,
}

impl Services {
    pub fn new() -> Self {
        let hasher = Arc::new(Sha256HasherHelper::new());
        let storage = ElasticsearchStorageRepository::new(
            "http://localhost:9200".into(),
            "elastic".into(),
            "changeme".into(),
            "%Y.%m.%d".into(),
            hasher,
        )
        .unwrap();
        let signer = EthereumSignerRepository::default();

        Self { storage: StorageService::new(storage), signer: SignerService::new(signer) }
    }
}
