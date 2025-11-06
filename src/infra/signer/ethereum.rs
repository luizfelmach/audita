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

    pub fn deploy_contract(url: String, pk: String) -> Result<String> {
        let signer: PrivateKeySigner = pk.parse()?;
        let wallet = EthereumWallet::from(signer.clone());
        let url = url.parse()?;
        let provider = ProviderBuilder::new().wallet(wallet).on_http(url);
        let provider = DynProvider::new(provider);

        let bytecode = hex::decode(
            // solc v0.8.26; solc Auditability.sol --optimize --bin
            "6080604052348015600f57600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506108038061005f6000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c8063261a323e1461005c5780638a1698431461008c5780638da5cb5b146100a8578063b411ee94146100c6578063dfd3aeb4146100f6575b600080fd5b610076600480360381019061007191906104c5565b610126565b6040516100839190610529565b60405180910390f35b6100a660048036038101906100a1919061057a565b61015e565b005b6100b0610280565b6040516100bd9190610617565b60405180910390f35b6100e060048036038101906100db91906104c5565b6102a4565b6040516100ed9190610641565b60405180910390f35b610110600480360381019061010b919061057a565b6102cf565b60405161011d9190610529565b60405180910390f35b600060018260405161013891906106cd565b908152602001604051809103902060010160009054906101000a900460ff169050919050565b60018260405161016e91906106cd565b908152602001604051809103902060010160009054906101000a900460ff16156101cd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101c490610741565b60405180910390fd5b6040518060400160405280828152602001600115158152506001836040516101f591906106cd565b90815260200160405180910390206000820151816000015560208201518160010160006101000a81548160ff0219169083151502179055509050508160405161023e91906106cd565b60405180910390207eff3b17f924e4b35c01665b132a03b874971fcee0b1643d98dd836380f28050826040516102749190610641565b60405180910390a25050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60006001826040516102b691906106cd565b9081526020016040518091039020600001549050919050565b60006001836040516102e191906106cd565b908152602001604051809103902060010160009054906101000a900460ff1661033f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610336906107ad565b60405180910390fd5b8160018460405161035091906106cd565b90815260200160405180910390206000015414905092915050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6103d282610389565b810181811067ffffffffffffffff821117156103f1576103f061039a565b5b80604052505050565b600061040461036b565b905061041082826103c9565b919050565b600067ffffffffffffffff8211156104305761042f61039a565b5b61043982610389565b9050602081019050919050565b82818337600083830152505050565b600061046861046384610415565b6103fa565b90508281526020810184848401111561048457610483610384565b5b61048f848285610446565b509392505050565b600082601f8301126104ac576104ab61037f565b5b81356104bc848260208601610455565b91505092915050565b6000602082840312156104db576104da610375565b5b600082013567ffffffffffffffff8111156104f9576104f861037a565b5b61050584828501610497565b91505092915050565b60008115159050919050565b6105238161050e565b82525050565b600060208201905061053e600083018461051a565b92915050565b6000819050919050565b61055781610544565b811461056257600080fd5b50565b6000813590506105748161054e565b92915050565b6000806040838503121561059157610590610375565b5b600083013567ffffffffffffffff8111156105af576105ae61037a565b5b6105bb85828601610497565b92505060206105cc85828601610565565b9150509250929050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610601826105d6565b9050919050565b610611816105f6565b82525050565b600060208201905061062c6000830184610608565b92915050565b61063b81610544565b82525050565b60006020820190506106566000830184610632565b92915050565b600081519050919050565b600081905092915050565b60005b83811015610690578082015181840152602081019050610675565b60008484015250505050565b60006106a78261065c565b6106b18185610667565b93506106c1818560208601610672565b80840191505092915050565b60006106d9828461069c565b915081905092915050565b600082825260208201905092915050565b7f496e64657820616c72656164792061646465642e000000000000000000000000600082015250565b600061072b6014836106e4565b9150610736826106f5565b602082019050919050565b6000602082019050818103600083015261075a8161071e565b9050919050565b7f496e646578206e6f7420666f756e642e00000000000000000000000000000000600082015250565b60006107976010836106e4565b91506107a282610761565b602082019050919050565b600060208201905081810360008301526107c68161078a565b905091905056fea26469706673582212202004dff2111a954524f636d5197a83846a69559f1ca20273f29daaf7dabd5d8264736f6c634300081b0033"
        )?;

        let tx = TransactionRequest::default().with_deploy_code(bytecode);

        let receipt =
            task::block_in_place(|| Handle::current().block_on(async { provider.send_transaction(tx).await?.get_receipt().await }))?;

        let contract_address = receipt.contract_address.expect("Failed to get contract address");

        Ok(contract_address.to_string())
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
