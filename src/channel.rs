use crate::{
    config::CONFIG,
    domain::{Batch, Document},
};
use std::sync::Arc;
use tokio::sync::{
    mpsc::{self, Receiver, Sender},
    Mutex,
};

#[derive(Clone)]
pub struct TxChannel {
    pub processor: Sender<Document>,
    pub signer: Sender<Batch>,
    pub storage: Sender<Batch>,
}

#[derive(Clone)]
pub struct RxChannel {
    pub processor: Arc<Mutex<Receiver<Document>>>,
    pub signer: Arc<Mutex<Receiver<Batch>>>,
    pub storage: Arc<Mutex<Receiver<Batch>>>,
}

pub fn init() -> (TxChannel, RxChannel) {
    let queue_size = CONFIG.queue_size;
    let (processor_tx, processor_rx) = mpsc::channel(queue_size);
    let (signer_tx, signer_rx) = mpsc::channel(queue_size);
    let (storage_tx, storage_rx) = mpsc::channel(queue_size);

    let transmitters = TxChannel { processor: processor_tx, signer: signer_tx, storage: storage_tx };
    let receivers = RxChannel {
        processor: Arc::new(Mutex::new(processor_rx)),
        signer: Arc::new(Mutex::new(signer_rx)),
        storage: Arc::new(Mutex::new(storage_rx)),
    };

    return (transmitters, receivers);
}
