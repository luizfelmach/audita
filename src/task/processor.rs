use crate::{
    domain::{DocumentStorable, Fingerprint},
    state::AppState,
};
use std::sync::Arc;
use uuid::Uuid;

pub async fn processor(state: Arc<AppState>) {
    let rx = state.rx.processor.clone();

    let mut buffer = Vec::new();
    let mut ord = 0;
    let mut id = Uuid::new_v4().to_string();

    while let Some(doc) = rx.lock().await.recv().await {
        let _ = state.tx.storage.send(DocumentStorable { doc: doc.clone(), id: id.clone(), ord }).await.unwrap();

        buffer.push(doc);
        ord += 1;

        if buffer.len() >= 5 {
            let digest = state.services.document_hasher.hash_documents(&buffer).unwrap();
            let _ = state.tx.signer.send(Fingerprint { hash: digest, id: id.clone() }).await.unwrap();

            buffer.clear();
            ord = 0;
            id = Uuid::new_v4().to_string();
        }
    }
}
