use anyhow::Result;
use config::{Config, File};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct AppState {
    pub contract: Option<String>,
}

impl AppState {
    fn contract_path() -> String {
        std::env::var("AUDITA_STATE").unwrap_or_else(|_| "./state.json".to_string())
    }

    pub fn init() -> Result<Self> {
        let path = Self::contract_path();
        let builder = Config::builder().add_source(File::with_name(&path).required(false));

        let config = builder.build()?;
        let state: AppState = config.try_deserialize()?;
        Ok(state)
    }

    pub fn save_contract(contract: String) -> Result<()> {
        let path = Self::contract_path();
        let tmp_state = AppState { contract: Some(contract) };

        let json_string = serde_json::to_string_pretty(&tmp_state)?;
        fs::write(path, json_string)?;
        Ok(())
    }
}
