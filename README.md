<p align="center">
  <img src="assets/audita.svg" alt="Logo do Audita" width="200"/>
</p>
<h1 align="center">Audita</h1>
<p align="center">
  <strong>Audita</strong> é um sistema de auditoria modular que garante a integridade dos dados e fornece trilhas de auditoria imutáveis para infraestruturas blockchain e nativas da nuvem.<br>
  Construído em Rust com integrações ao Prometheus, ElasticSearch e Ethereum, ele cria registros criptograficamente seguros para garantir a integridade do sistema e conformidade.
</p>

## 📑 Índice
- [🚀 Funcionalidades](#-funcionalidades)
- [📦 Instalação](#-instalação)
  - [Opção 1: Docker (Recomendado)](#opção-1-docker-recomendado)
  - [Opção 2: Compilar do Código Fonte](#opção-2-compilar-do-código-fonte)
  - [Opção 3: Executar via Binário Pré-compilado](#opção-3-executar-via-binário-pré-compilado)
- [⚙️ Configuração](#️-configuração)
  - [Formato do Arquivo de Configuração](#formato-do-arquivo-de-configuração)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Opções de Configuração](#opções-de-configuração)

## 🚀 Funcionalidades
- ⚙️ Backend de alta performance em Rust
- 📦 Containerizado via Docker
- 📈 Integração com Prometheus & Grafana
- 🔍 Suporte ao Elasticsearch para logs pesquisáveis
- ⛓️ Pipeline compatível com Ethereum Besu
- 🧩 Arquitetura modular para fácil extensão

## 📦 Instalação
### Opção 1: Docker (Recomendado)
```bash
docker run ghcr.io/luizfelmach/audita:latest
```

### Opção 2: Compilar do Código Fonte
Pré-requisitos: Rust e Cargo instalados.
```bash
git clone https://github.com/luizfelmach/audita.git
cd audita
cargo build --release
./target/release/audita
```

### Opção 3: Executar via Binário Pré-compilado
1. Baixe o binário mais recente para sua plataforma na [página de Releases](https://github.com/luizfelmach/audita/releases)
2. Torne-o executável:
```bash
chmod +x audita
./audita
```

## ⚙️ Configuração
O Audita pode ser configurado através de arquivos de configuração ou variáveis de ambiente. As fontes de configuração são carregadas na seguinte ordem de precedência:
1. `/etc/audita/config.toml` (sistema)
2. `~/.config/audita/config.toml` (específico do usuário)
3. `config.toml` (diretório atual)
4. `config/dev.toml` (configuração de desenvolvimento)
5. Variáveis de ambiente (maior prioridade)

### Formato do Arquivo de Configuração
Crie um arquivo `config.toml` com a seguinte estrutura:
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

### Variáveis de Ambiente
Todas as opções de configuração podem ser sobrescritas usando variáveis de ambiente com o prefixo `AUDITA_`. Para seções de configuração aninhadas, use sublinhados duplos (`__`).

Exemplos:
```bash
export AUDITA_PORT=8080
export AUDITA_HOST="127.0.0.1"
export AUDITA_ETHEREUM__URL="http://localhost:8545"
export AUDITA_ETHEREUM__CONTRACT="0x42699A7612A82f1d9C36148af9C77354759b210b"
export AUDITA_ELASTIC__URL="http://localhost:9200"
export AUDITA_ELASTIC__USERNAME="elastic"
```

### Opções de Configuração
| Opção | Descrição | Padrão |
|-------|-----------|---------|
| `host` | Endereço de bind do servidor | `0.0.0.0` |
| `port` | Porta do servidor | `8080` |
| `queue_size` | Tamanho da fila interna | `8192` |
| `batch_size` | Tamanho do processamento em lote | `5` |
| `ethereum.url` | URL do nó Ethereum | - |
| `ethereum.contract` | Endereço do contrato inteligente | - |
| `ethereum.private_key` | Chave privada para transações | - |
| `ethereum.max_tx_pending` | Máximo de transações pendentes | `50` |
| `elastic.url` | URL do ElasticSearch | - |
| `elastic.username` | Nome de usuário do ElasticSearch | - |
| `elastic.password` | Senha do ElasticSearch | - |
| `elastic.indices_pattern` | Padrão de nomenclatura dos índices | `%Y.%m.%d` |