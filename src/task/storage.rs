use crate::state::AppState;
use std::sync::Arc;

pub async fn storage(state: Arc<AppState>) {
    let rx = state.rx.storage.clone();
    let mut buffer = Vec::new();

    while let Some(doc) = rx.lock().await.recv().await {
        buffer.push(doc);

        if buffer.len() >= 1 {
            let _ = state.services.document.store(&buffer).await.unwrap();
            buffer.clear();
        }
    }
}
