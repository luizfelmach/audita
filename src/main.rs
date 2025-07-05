mod config;
mod domain;
mod factories;
mod infra;
mod presentation;
mod tasks;

use crate::{
    config::AppConfig,
    factories::{make_hasher, make_pipeline, make_signer_repository, make_storage_repository, make_uuid_generator},
    tasks::{SignerTask, StorageTask, WorkerTask},
};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let config = AppConfig::init().unwrap();
    let pipeline = make_pipeline(config.queue_size);
    let hasher = make_hasher();
    let uuid = make_uuid_generator();
    let signer = make_signer_repository(&config);
    let storage = make_storage_repository(&config, hasher.clone());

    let worker_task = WorkerTask::new(pipeline.clone(), hasher, uuid, config.batch_size);
    let signer_task = SignerTask::new(pipeline.clone(), signer);
    let storage_task = StorageTask::new(pipeline.clone(), storage);

    tokio::select! {
        () = worker_task.run() => {},
        () = signer_task.run() => {},
        () = storage_task.run() => {},
    }
}
