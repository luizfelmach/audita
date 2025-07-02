use crate::state::AppState;
use std::sync::Arc;

pub async fn storage(state: Arc<AppState>) {
    let rx = state.rx.storage.clone();
    let storage = state.services.storage.clone();

    while let Some(batch) = rx.lock().await.recv().await {
        let _ = storage.submit(&batch).await.unwrap();
    }
}
