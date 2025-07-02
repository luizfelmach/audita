use crate::{
    application::{DocumentHasherService, DocumentService, FingerprintService},
    infrastructure::{
        document::ElasticsearchDocumentRepository, fingerprint::AlloyEthereumFingerprintRepository, helper::Sha256DocumentHasherHelper,
    },
};

#[derive(Clone)]
pub struct Services {
    pub document: DocumentService<ElasticsearchDocumentRepository>,
    pub fingerprint: FingerprintService<AlloyEthereumFingerprintRepository>,
    pub document_hasher: DocumentHasherService<Sha256DocumentHasherHelper>,
}

impl Services {
    pub fn new() -> Self {
        let doc_repo = ElasticsearchDocumentRepository::new("http://localhost:9200".into(), "elastic".into(), "changeme".into()).unwrap();
        let fp_repo = AlloyEthereumFingerprintRepository::new(
            "http://localhost:8545/".into(),
            "0x42699A7612A82f1d9C36148af9C77354759b210b".into(),
            "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63".into(),
        )
        .unwrap();
        let doc_hasher_helper = Sha256DocumentHasherHelper;

        Self {
            document: DocumentService::new(doc_repo),
            fingerprint: FingerprintService::new(fp_repo),
            document_hasher: DocumentHasherService::new(doc_hasher_helper),
        }
    }
}
