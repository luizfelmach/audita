use crate::domain::UuidGenerator;
use uuid::Uuid;

#[derive(Clone)]
pub struct UuidV4GeneratorHelper;

impl UuidGenerator for UuidV4GeneratorHelper {
    fn generate(&self) -> String {
        return Uuid::new_v4().to_string();
    }
}
