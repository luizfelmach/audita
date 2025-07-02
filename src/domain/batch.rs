use crate::domain::Document;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Batch {
    pub id: String,
    pub documents: Vec<Document>,
    pub digest: [u8; 32],
}
