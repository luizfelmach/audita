<p align="center">
  <img src="assets/audita.svg" alt="Audita Logo" width="200"/>
</p>

<h1 align="center">Audita</h1>

<p align="center">
  <strong>Audita</strong> is a modular auditing system that ensures data integrity and provides immutable audit trails for blockchain and cloud-native infrastructures.<br>
  Built in Rust with integrations to Prometheus, ElasticSearch, and Ethereum, it creates cryptographically secure records to guarantee system integrity and compliance.
</p>


## 🚀 Features

- ⚙️ High-performance Rust backend
- 📦 Containerized via Docker
- 📈 Prometheus & Grafana integration
- 🔍 Elasticsearch support for searchable logs
- ⛓️ Ethereum Besu-compatible pipeline
- 🧩 Modular architecture for easy extension


## 📦 Installation

### Option 1: Docker (Recommended)
```bash
docker run ghcr.io/luizfelmach/audita:latest
```

### Option 2: Build from Source
Prerequisites: Rust and Cargo installed.

```bash
git clone https://github.com/luizfelmach/audita.git
cd audita
cargo build --release
./target/release/audita
```

### Option 3: Run via Precompiled Binary
1. Download the latest binary for your platform from the [Releases page](https://github.com/luizfelmach/audita/releases)
2. Make it executable:
```bash
chmod +x audita
./audita
```

## ⚙️ Configuration

Audita can be configured through configuration files or environment variables. Configuration sources are loaded in the following order of precedence:

1. `/etc/audita/config.toml` (system-wide)
2. `~/.config/audita/config.toml` (user-specific)
3. `config.toml` (current directory)
4. `config/dev.toml` (development config)
5. Environment variables (highest priority)

### Configuration File Format

Create a `config.toml` file with the following structure:

```toml
host = "0.0.0.0"
name = "worker"
port = 8080
queue_size = 8192
batch_size = 5

[ethereum]
url = "http://localhost:8545"
contract = "0x42699A7612A82f1d9C36148af9C77354759b210b"
private_key = "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
max_tx_pending = 50

[elastic]
url = "http://localhost:9200"
username = "elastic"
password = "changeme"
indices_pattern = "%Y.%m.%d"
```

### Environment Variables

All configuration options can be overridden using environment variables with the `AUDITA_` prefix. For nested configuration sections, use double underscores (`__`).

Examples:
```bash
export AUDITA_PORT=8080
export AUDITA_HOST="127.0.0.1"
export AUDITA_ETHEREUM__URL="http://localhost:8545"
export AUDITA_ETHEREUM__CONTRACT="0x42699A7612A82f1d9C36148af9C77354759b210b"
export AUDITA_ELASTIC__URL="http://localhost:9200"
export AUDITA_ELASTIC__USERNAME="elastic"
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `host` | Server bind address | `0.0.0.0` |
| `port` | Server port | `8080` |
| `queue_size` | Internal queue size | `8192` |
| `batch_size` | Batch processing size | `5` |
| `ethereum.url` | Ethereum node URL | - |
| `ethereum.contract` | Smart contract address | - |
| `ethereum.private_key` | Private key for transactions | - |
| `ethereum.max_tx_pending` | Maximum pending transactions | `50` |
| `elastic.url` | ElasticSearch URL | - |
| `elastic.username` | ElasticSearch username | - |
| `elastic.password` | ElasticSearch password | - |
| `elastic.indices_pattern` | Index naming pattern | `%Y.%m.%d` |
