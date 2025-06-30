use crate::{
    application::{DocumentHasherService, DocumentService, FingerprintService},
    infrastructure::{document::MemoryDocumentRepository, fingerprint::MemoryFingerprintRepository, helper::Sha256DocumentHasherHelper},
};

#[derive(Clone)]
pub struct Services {
    pub document: DocumentService<MemoryDocumentRepository>,
    pub fingerprint: FingerprintService<MemoryFingerprintRepository>,
    pub document_hasher: DocumentHasherService<Sha256DocumentHasherHelper>,
}

impl Services {
    pub fn new() -> Self {
        let doc_repo = MemoryDocumentRepository::new();
        let fp_repo = MemoryFingerprintRepository::new();
        let doc_hasher_helper = Sha256DocumentHasherHelper;

        Self {
            document: DocumentService::new(doc_repo),
            fingerprint: FingerprintService::new(fp_repo),
            document_hasher: DocumentHasherService::new(doc_hasher_helper),
        }
    }
}
