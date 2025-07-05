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
use async_trait::async_trait;
use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
    time::Duration,
};
use tokio::{runtime::Handle, sync::Semaphore, task, time::sleep};

#[derive(Clone)]
pub struct EthereumSignerRepository {
    provider: DynProvider,
    signer: PrivateKeySigner,
    instance: Auditability::AuditabilityInstance<(), DynProvider>,
    nonce: Arc<AtomicU64>,
    max_tx_pending: Arc<Semaphore>,
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
    pub fn new(url: String, contract: String, pk: String, max_tx_pending: usize) -> Result<Self> {
        let signer: PrivateKeySigner = pk.parse()?;
        let wallet = EthereumWallet::from(signer.clone());
        let url = url.parse()?;
        let provider = ProviderBuilder::new().wallet(wallet).on_http(url);
        let provider = DynProvider::new(provider);
        let contract = contract.parse()?;
        let instance = Auditability::new(contract, provider.clone());
        let address = signer.address();

        let nonce = task::block_in_place(|| Handle::current().block_on(async { provider.get_transaction_count(address).await }))?;

        Ok(Self {
            provider,
            signer,
            instance,
            nonce: Arc::new(AtomicU64::new(nonce)),
            max_tx_pending: Arc::new(Semaphore::new(max_tx_pending)),
        })
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

    async fn store(&self, id: &String, hash: &[u8; 32], nonce: u64) -> Result<()> {
        let call = self.instance.store(id.clone(), hash.into()).nonce(nonce).send().await?;
        let tx = call.tx_hash().0;
        let _ = self.confirm(&tx).await?;
        Ok(())
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

#[async_trait]
impl SignerRepository for EthereumSignerRepository {
    async fn publish(&self, batch: &Batch) -> Result<()> {
        let _permit = self.max_tx_pending.clone().acquire_owned().await?;

        let nonce = self.nonce.fetch_add(1, Ordering::SeqCst);
        let mut attempts = 0;
        let max_attempts = 3;

        loop {
            attempts += 1;
            match self.store(&batch.id, &batch.digest, nonce).await {
                Ok(()) => break,
                Err(_) if attempts <= max_attempts => {
                    sleep(Duration::from_millis(100 * attempts)).await;
                }
                Err(err) => {
                    self.remove(nonce).await?;
                    bail!("failed to send transaction after {} attempts: {}", attempts, err)
                }
            }
        }

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
