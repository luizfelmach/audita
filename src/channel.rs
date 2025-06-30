use crate::domain::{Document, DocumentStorable, Fingerprint};
use std::sync::Arc;
use tokio::sync::{
    mpsc::{self, Receiver, Sender},
    Mutex,
};

#[derive(Clone)]
pub struct TxChannel {
    pub processor: Sender<Document>,
    pub signer: Sender<Fingerprint>,
    pub storage: Sender<DocumentStorable>,
}

#[derive(Clone)]
pub struct RxChannel {
    pub processor: Arc<Mutex<Receiver<Document>>>,
    pub signer: Arc<Mutex<Receiver<Fingerprint>>>,
    pub storage: Arc<Mutex<Receiver<DocumentStorable>>>,
}

pub fn new(size: usize) -> (TxChannel, RxChannel) {
    let (processor_tx, processor_rx) = mpsc::channel(size);
    let (signer_tx, signer_rx) = mpsc::channel(size);
    let (storage_tx, storage_rx) = mpsc::channel(size);

    let transmitters = TxChannel { processor: processor_tx, signer: signer_tx, storage: storage_tx };
    let receivers = RxChannel {
        processor: Arc::new(Mutex::new(processor_rx)),
        signer: Arc::new(Mutex::new(signer_rx)),
        storage: Arc::new(Mutex::new(storage_rx)),
    };

    return (transmitters, receivers);
}
