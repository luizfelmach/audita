use crate::domain::Channel;
use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

#[derive(Clone)]
pub struct TokioChannel<T> {
    sender: mpsc::Sender<T>,
    receiver: Arc<Mutex<mpsc::Receiver<T>>>,
}

impl<T> TokioChannel<T> {
    pub fn new(buffer: usize) -> Self {
        let (sender, receiver) = mpsc::channel(buffer);
        Self { sender, receiver: Arc::new(Mutex::new(receiver)) }
    }
}

#[async_trait]
impl<T: Send + Sync> Channel<T> for TokioChannel<T> {
    async fn send(&self, item: T) {
        let _ = self.sender.send(item).await;
    }

    async fn recv(&self) -> Option<T> {
        self.receiver.lock().await.recv().await
    }
}
