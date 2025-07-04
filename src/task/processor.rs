use crate::domain::{Batch, Document, Hasher};
use std::sync::Arc;
use tokio::sync::{
    mpsc::{Receiver, Sender},
    Mutex,
};

#[derive(Clone)]
pub struct Processor {
    receiver: Arc<Mutex<Receiver<Document>>>,
    signer: Sender<Batch>,
    storage: Sender<Batch>,
    hasher: Arc<dyn Hasher>,
    batch_size: usize,
}

impl Processor {
    pub fn new(
        receiver: Receiver<Document>, storage: Sender<Batch>, signer: Sender<Batch>, hasher: Arc<dyn Hasher>, batch_size: usize,
    ) -> Self {
        Self { receiver: Arc::new(Mutex::new(receiver)), storage, signer, hasher, batch_size }
    }

    pub async fn perform(&self) {
        let mut buffer = Vec::new();

        while let Some(document) = self.receiver.lock().await.recv().await {
            buffer.push(document);

            if buffer.len() >= self.batch_size {
                let digest = self.hasher.digest(&buffer).unwrap();
                let batch = Batch { id: uuid::Uuid::new_v4().to_string(), documents: std::mem::take(&mut buffer), digest };

                let _ = self.storage.send(batch.clone()).await.unwrap();
                let _ = self.signer.send(batch).await.unwrap();
            }
        }
    }
}

// use crate::{
//     domain::{Batch, Document, Hasher},
//     infra::helper::Sha256HasherHelper,
//     state::AppState,
// };
// use std::sync::Arc;
// use uuid::Uuid;

// pub async fn _processor<D, S, T, H>(mut rx: D, storage: S, signer: T, hasher: H, batch_size: usize)
// where
//     H: Hasher + Send + Sync,
// {
//     let mut buffer = vec![];

//     while let Some(document) = rx.recv().await {
//         buffer.push(document);

//         if buffer.len() >= batch_size {
//             let id = uuid::Uuid::new_v4().to_string();
//             let digest = hasher.digest(&buffer).unwrap();

//             let batch = Batch { id, documents: std::mem::take(&mut buffer), digest };

//             let _ = storage.send(batch.clone()).await.unwrap();
//             let _ = signer.send(batch.clone()).await.unwrap();
//         }
//     }
// }

// pub async fn processor(state: Arc<AppState>) {
//     let rx = state.rx.processor.clone();
//     let storage = state.tx.storage.clone();
//     let signer = state.tx.signer.clone();
//     let hasher = Sha256HasherHelper::new();

//     let batch_size = state.config.batch_size;
//     let mut buffer = Vec::new();

//     while let Some(document) = rx.lock().await.recv().await {
//         buffer.push(document);

//         if buffer.len() >= batch_size {
//             let id = Uuid::new_v4().to_string();
//             let digest = hasher.digest(&buffer).unwrap();
//             let batch = Batch { id: id.clone(), documents: std::mem::take(&mut buffer), digest };
//             let _ = storage.send(batch.clone()).await.unwrap();
//             let _ = signer.send(batch.clone()).await.unwrap();
//         }
//     }
// }
