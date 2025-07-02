use crate::state::AppState;
use std::sync::Arc;

pub async fn signer(state: Arc<AppState>) {
    let rx = state.rx.signer.clone();
    let mut buffer = Vec::new();

    while let Some(fp) = rx.lock().await.recv().await {
        buffer.push(fp);

        if buffer.len() >= 1 {
            let mut txs = Vec::new();
            for fp in buffer.drain(..) {
                let tx = state.services.fingerprint.submit(fp).await.unwrap();
                txs.push(tx);
            }
            for tx in txs {
                let _confirmed = state.services.fingerprint.confirm(tx).await.unwrap();
            }
        }
    }
}
