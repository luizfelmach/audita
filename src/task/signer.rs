use crate::state::AppState;
use std::sync::Arc;
use tokio::task;

pub async fn signer(state: Arc<AppState>) {
    let rx = state.rx.signer.clone();
    let signer = state.services.signer.clone();

    while let Some(batch) = rx.lock().await.recv().await {
        let signer = signer.clone();

        task::spawn(async move {
            match signer.submit(&batch).await {
                Ok(_) => {
                    println!("batch completed ({})", batch.id);
                }
                Err(err) => {
                    eprintln!("Failed to submit batch: {:?}", err);
                }
            }
        });
    }
}
