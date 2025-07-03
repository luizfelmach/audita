use crate::state::AppState;
use std::sync::Arc;

pub async fn signer(state: Arc<AppState>) {
    let rx = state.rx.signer.clone();
    let signer = state.services.signer.clone();
    let mut buffer = Vec::new();

    while let Some(batch) = rx.lock().await.recv().await {
        buffer.push(batch);

        if buffer.len() >= 1 {
            let _ = signer.submit(&buffer).await.unwrap();
            buffer.clear();
        }
    }
}
