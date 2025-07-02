use crate::{
    application::{SignerService, StorageService},
    infra::{helper::Sha256HasherHelper, signer::EthereumSignerRepository, storage::MemoryStorageRepository},
};
use std::sync::Arc;

#[derive(Clone)]
pub struct Services {
    pub storage: StorageService<MemoryStorageRepository>,
    pub signer: SignerService<EthereumSignerRepository>,
}

impl Services {
    pub fn new() -> Self {
        let hasher = Arc::new(Sha256HasherHelper::new());
        let storage = MemoryStorageRepository::new(hasher);
        let signer = EthereumSignerRepository::default();

        Self { storage: StorageService::new(storage), signer: SignerService::new(signer) }
    }
}
