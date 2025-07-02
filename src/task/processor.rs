use crate::{
    domain::{Batch, Hasher},
    infra::helper::Sha256HasherHelper,
    state::AppState,
};
use std::sync::Arc;
use uuid::Uuid;

pub async fn processor(state: Arc<AppState>) {
    let rx = state.rx.processor.clone();
    let storage = state.tx.storage.clone();
    let signer = state.tx.signer.clone();
    let hasher = Sha256HasherHelper::new();
    let mut buffer = Vec::new();
    let id = Uuid::new_v4().to_string();

    while let Some(document) = rx.lock().await.recv().await {
        buffer.push(document);

        if buffer.len() >= 5 {
            let digest = hasher.digest(&buffer).unwrap();
            let batch = Batch { id: id.clone(), documents: buffer.clone(), digest };
            let _ = storage.send(batch.clone()).await.unwrap();
            let _ = signer.send(batch.clone()).await.unwrap();
            buffer.clear();
        }
    }
}
