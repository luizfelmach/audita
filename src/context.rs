use crate::{
    config::AppConfig,
    domain::{DynHasher, DynSignerRepository, DynStorageRepository, DynUuidGenerator, Pipeline},
    factories::{make_hasher, make_pipeline, make_signer_repository, make_storage_repository, make_uuid_generator},
};
use anyhow::Result;
use std::sync::Arc;

#[derive(Clone)]
pub struct Context {
    pub config: AppConfig,
    pub pipeline: Pipeline,
    pub signer: DynSignerRepository,
    pub storage: DynStorageRepository,
    pub hasher: DynHasher,
    pub uuid: DynUuidGenerator,
}

impl Context {
    pub fn init() -> Result<Arc<Self>> {
        let config = AppConfig::init().unwrap();
        let pipeline = make_pipeline(config.queue_size);
        let hasher = make_hasher();
        let uuid = make_uuid_generator();
        let signer = make_signer_repository(&config)?;
        let storage = make_storage_repository(&config, hasher.clone())?;

        Ok(Arc::new(Self { config, pipeline, signer, storage, hasher, uuid }))
    }
}
