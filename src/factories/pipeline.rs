use crate::{domain::Pipeline, infra::channel::TokioChannel};
use std::sync::Arc;

pub fn make_pipeline(size: usize) -> Pipeline {
    let worker = TokioChannel::new(size);
    let signer = TokioChannel::new(size);
    let storage = TokioChannel::new(size);

    Pipeline::new(Arc::new(worker), Arc::new(signer), Arc::new(storage))
}
