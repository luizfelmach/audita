use crate::{
    domain::{DynHasher, DynUuidGenerator},
    infra::helper::{Sha256HasherHelper, UuidV4GeneratorHelper},
};
use std::sync::Arc;

pub fn make_hasher() -> DynHasher {
    let hasher = Sha256HasherHelper {};
    Arc::new(hasher)
}

pub fn make_uuid_generator() -> DynUuidGenerator {
    let uuid = UuidV4GeneratorHelper {};
    Arc::new(uuid)
}
