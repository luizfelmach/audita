use crate::domain::{Batch, Document, DynChannel};
use std::sync::Arc;

#[derive(Clone)]
pub struct Pipeline {
    pub worker: DynChannel<Document>,
    pub signer: DynChannel<Arc<Batch>>,
    pub storage: DynChannel<Arc<Batch>>,
}

impl Pipeline {
    pub fn new(worker: DynChannel<Document>, signer: DynChannel<Arc<Batch>>, storage: DynChannel<Arc<Batch>>) -> Self {
        Self { worker, signer, storage }
    }
}
