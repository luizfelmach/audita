use anyhow::Result;

use crate::{domain::Digest, state::AppState};
use std::sync::Arc;

pub async fn signer(state: Arc<AppState>) {
    let rx = state.rx.signer.clone();
    let mut buffer = Vec::new();

    while let Some(fp) = rx.lock().await.recv().await {
        buffer.push(fp);

        if buffer.len() >= 1 {
            let txs: Vec<Digest> = buffer.drain(..).map(|fp| state.services.fingerprint.submit(fp)).collect::<Result<_>>().unwrap();
            let _: Vec<Digest> = txs.iter().map(|tx| state.services.fingerprint.confirm(*tx)).collect::<Result<_>>().unwrap();
        }
    }
}
