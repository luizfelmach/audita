use crate::domain::{Batch, SignerRepository};
use alloy::{
    network::{EthereumWallet, TransactionBuilder},
    primitives::U256,
    providers::{DynProvider, Provider, ProviderBuilder},
    rpc::types::TransactionRequest,
    signers::local::PrivateKeySigner,
    sol,
};
use anyhow::{bail, Result};
use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
    time::Duration,
};
use tokio::{runtime::Handle, sync::Semaphore};

#[derive(Clone)]
pub struct EthereumSignerRepository {
    provider: DynProvider,
    signer: PrivateKeySigner,
    instance: Auditability::AuditabilityInstance<(), DynProvider>,
    nonce: Arc<AtomicU64>,
    pending: Arc<Semaphore>,
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

impl EthereumSignerRepository {
    pub fn new(url: String, contract: String, pk: String) -> Result<Self> {
        let signer: PrivateKeySigner = pk.parse()?;
        let wallet = EthereumWallet::from(signer.clone());
        let url = url.parse()?;
        let provider = ProviderBuilder::new().wallet(wallet).on_http(url);
        let provider = DynProvider::new(provider);
        let contract = contract.parse()?;
        let instance = Auditability::new(contract, provider.clone());
        let address = signer.address();

        let nonce = tokio::task::block_in_place(|| Handle::current().block_on(async { provider.get_transaction_count(address).await }))?;

        Ok(Self { provider, signer, instance, nonce: Arc::new(AtomicU64::new(nonce)), pending: Arc::new(Semaphore::new(3000)) })
    }

    async fn nonce(&self) -> Result<u64> {
        let address = self.signer.address();
        let nonce = self.provider.get_transaction_count(address).await?;
        Ok(nonce)
    }

    async fn confirm(&self, tx: &[u8; 32]) -> Result<[u8; 32]> {
        let mut interval = tokio::time::interval(Duration::from_millis(500));
        loop {
            interval.tick().await;
            match self.provider.get_transaction_receipt(tx.into()).await {
                Ok(Some(receipt)) => return Ok(receipt.transaction_hash.0),
                Ok(None) => continue,
                Err(err) => bail!("failed to get transaction receipt: {}", err),
            }
        }
    }

    async fn store(&self, id: &String, hash: &[u8; 32]) -> Result<([u8; 32], u64)> {
        let nonce = self.nonce.fetch_add(1, Ordering::SeqCst);
        let call = self.instance.store(id.clone(), hash.into()).nonce(nonce).send().await;
        match call {
            Ok(tx) => Ok((tx.tx_hash().0, nonce)),
            Err(err) => {
                self.remove(nonce).await?;
                bail!("failed to call contract function `store` with id `{}` and hash `{:?}`: {:?}", id, hash, err);
            }
        }
    }

    async fn remove(&self, nonce: u64) -> Result<()> {
        let address = self.signer.address();
        let tx = TransactionRequest::default()
            .with_to(address)
            .with_nonce(nonce)
            .with_value(U256::ZERO)
            .with_gas_limit(21_000)
            .with_max_priority_fee_per_gas(1_000_000_000)
            .with_max_fee_per_gas(20_000_000_000);
        let _ = self.provider.send_transaction(tx).await?.get_receipt().await?;
        Ok(())
    }

    async fn exists(&self, id: &String) -> Result<bool> {
        match self.instance.exists(id.clone()).call().await {
            Ok(exists) => Ok(exists._0),
            Err(err) => bail!("failed to call contract function `exists` with id `{}`: {:?}", id, err),
        }
    }
}

impl Default for EthereumSignerRepository {
    fn default() -> Self {
        Self::new(
            "http://localhost:8545".into(),
            "0x42699A7612A82f1d9C36148af9C77354759b210b".into(),
            "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63".into(),
        )
        .unwrap()
    }
}

impl SignerRepository for EthereumSignerRepository {
    async fn publish(&self, batch: &Batch) -> Result<()> {
        let permit = self.pending.clone().acquire_owned().await?;
        let (tx, nonce) = self.store(&batch.id, &batch.digest).await?;
        if let Err(_) = self.confirm(&tx).await {
            self.remove(nonce).await?;
        }
        drop(permit);
        Ok(())
    }

    async fn digest(&self, id: &String) -> Result<Option<[u8; 32]>> {
        if !self.exists(id).await? {
            return Ok(None);
        }
        match self.instance.hash(id.clone()).call().await {
            Ok(hash) => Ok(Some(hash._0.0)),
            Err(err) => bail!("failed to call contract function `hash` with id `{}`: {:?}", id, err),
        }
    }
}
