use alloy::{
    network::EthereumWallet,
    providers::{DynProvider, Provider, ProviderBuilder},
    signers::local::PrivateKeySigner,
    sol,
};
use anyhow::{bail, Result};
use std::time::Duration;

use crate::domain::{Fingerprint, FingerprintRepository};

#[derive(Debug, Clone)]
pub struct AlloyEthereumFingerprintRepository {
    provider: DynProvider,
    signer: PrivateKeySigner,
    instance: Auditability::AuditabilityInstance<(), DynProvider>,
}

sol! {
    #[sol(rpc)]
    contract Auditability {
        function store(string id, bytes32 digest) external;
        function proof(string id, bytes32 digest) external view returns (bool);
        function hash(string id) external view returns (bytes32);
        function exists(string id) external view returns (bool);
    }
}

impl AlloyEthereumFingerprintRepository {
    pub fn new(url: String, contract: String, pk: String) -> Result<Self> {
        let signer: PrivateKeySigner = pk.parse()?;
        let wallet = EthereumWallet::from(signer.clone());
        let url_parsed = url.parse()?;
        let provider = ProviderBuilder::new().wallet(wallet).on_http(url_parsed);
        let provider = DynProvider::new(provider);
        let contract = contract.parse()?;
        let instance = Auditability::new(contract, provider.clone());

        Ok(Self { provider, signer, instance })
    }

    pub async fn nonce(&self) -> Result<u64> {
        let address = self.signer.address();
        let nonce = self.provider.get_transaction_count(address).await?;
        Ok(nonce)
    }
}

impl FingerprintRepository for AlloyEthereumFingerprintRepository {
    async fn submit(&self, fingerprint: &Fingerprint) -> Result<[u8; 32]> {
        let mut attempt = 0;
        let nonce = self.nonce().await?;
        let Fingerprint { id, hash } = fingerprint;

        loop {
            let result = {
                let call = self.instance.store(id.clone(), hash.into()).nonce(nonce);
                call.send().await
            };

            if let Ok(tx) = result {
                return Ok(tx.tx_hash().0);
            }

            attempt += 1;
            if attempt >= 3 {
                bail!("failed to send tx");
            }

            tokio::time::sleep(Duration::from_millis(200)).await;
        }
    }

    async fn confirm(&self, tx: &[u8; 32]) -> Result<[u8; 32]> {
        let mut interval = tokio::time::interval(Duration::from_millis(500));
        loop {
            interval.tick().await;
            match self.provider.get_transaction_receipt(tx.into()).await {
                Ok(Some(receipt)) => return Ok(receipt.transaction_hash.0),
                Ok(None) => continue,
                Err(err) => bail!("failed to get transaction receipt: {err}"),
            }
        }
    }

    async fn find_by_id(&self, id: &String) -> Result<Option<Fingerprint>> {
        match self.instance.hash(id.clone()).call().await {
            Ok(hash) => Ok(Some(Fingerprint { id: id.clone(), hash: hash._0.0 })),
            Err(err) => bail!("Failed to get hash: {err}"),
        }
    }
}
