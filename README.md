<p align="center">
  <img src="assets/audita.svg" alt="Logo do Audita" width="200"/>
</p>
<h1 align="center">Audita</h1>
<p align="center">
  <strong>Audita</strong> é um sistema de auditoria especializado em rastreamento de acesso à rede, criando trilhas de auditoria imutáveis que identificam quem, quando e como acessou os recursos da rede.<br>
  Construído em Rust com integrações ao Prometheus, ElasticSearch e Ethereum, ele coleta e correlaciona logs críticos de firewall, DHCP e RADIUS, utilizando blockchain como camada de verificação criptográfica para garantir a integridade temporal dos registros de acesso.
</p>

## 📑 Índice

- [🔍 Como Funciona](#-como-funciona)
  - [Fluxo de Acesso à Rede](#fluxo-de-acesso-à-rede)
  - [Logs do Firewall](#logs-do-firewall)
  - [Logs do DHCP](#logs-do-dhcp)
  - [Autenticação via RADIUS](#autenticação-via-radius)
  - [Verificação por Blockchain](#verificação-por-blockchain)
- [🚀 Funcionalidades](#-funcionalidades)
- [📦 Instalação](#-instalação)
  - [Opção 1: Docker (Recomendado)](#opção-1-docker-recomendado)
  - [Opção 2: Compilar do Código Fonte](#opção-2-compilar-do-código-fonte)
  - [Opção 3: Executar via Binário Pré-compilado](#opção-3-executar-via-binário-pré-compilado)
- [⛓️ Deploy do Contrato](#️-deploy-do-contrato)
- [⚙️ Configuração](#️-configuração)
  - [Formato do Arquivo de Configuração](#formato-do-arquivo-de-configuração)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Opções de Configuração](#opções-de-configuração)
- [🎯 Uso Básico](#-uso-básico)
  - [Enviando Logs para a Aplicação](#enviando-logs-para-a-aplicação)
  - [Identificando Quem Estava Logado](#identificando-quem-estava-logado)
  - [Verificação de Integridade](#verificação-de-integridade)
- [🔌 Integração com Coletores de Logs](#-integração-com-coletores-de-logs)
- [📊 Monitoramento com Prometheus (Bonus)](#-monitoramento-com-prometheus-bonus)

## 🔍 Como Funciona

### Fluxo de Acesso à Rede

O Audita rastreia o fluxo completo de acesso à rede, desde a autenticação do usuário até suas atividades de rede:

1. **Usuário se conecta** → Autenticação via RADIUS
2. **DHCP atribui IP** → Correlação usuário ↔ IP interno
3. **Firewall registra atividade** → Logs de acesso com IP interno
4. **NAT traduz endereços** → Mapeamento IP interno ↔ IP externo
5. **Audita correlaciona** → Identifica quem fez cada acesso

### Logs do Firewall

Os logs de firewall são essenciais para rastrear atividades de rede:

```
{
  "@timestamp": "2025-07-14T14:04:33.000Z",
  "dst_ip": "172.21.29.221",
  "dst_mapped_ip": "200.137.65.102",
  "dst_mapped_port": "57738",
  "dst_port": "57738",
  "src_ip": "54.186.142.142",
  "src_mapped_ip": "54.186.142.142",
  "src_mapped_port": "443",
  "src_port": "443",
  "type": "fw",
  ...
}
```

O Audita captura e processa esses logs para:
- Rastrear destinos acessados
- Correlacionar com dados de autenticação

### Logs do DHCP

Os logs do DHCP são essenciais para saber o MAC address do IP interno atribuído:

```
{
  "@timestamp": "2025-07-14T14:04:26.634814527Z",
  "ip": "172.21.29.221",
  "lease_time": "4000",
  "mac": "58:6c:25:a0:ba:6d",
  "type": "dhcp"
}
```

### Autenticação via RADIUS

O servidor RADIUS fornece a camada de identificação de usuários:

```
{
  "@timestamp": "2025-07-14T14:04:26.427588699Z",
  "mac": "58-6c-25-a0-ba-6d",
  "type": "radius",
  "username": "usuario-logado"
}
```

Essa correlação permite que o Audita saiba exatamente:
- Quem está por trás de cada IP interno
- Quando a sessão começou e terminou
- Qual dispositivo está sendo usado

### Verificação por Blockchain

A blockchain atua como uma camada adicional de verificação:

- **Hash dos logs**: Cada lote de logs gera um hash único
- **Timestamp imutável**: Registra quando os logs foram processados
- **Verificação de integridade**: Permite detectar alterações posteriores nos dados
- **Trilha de auditoria**: Cria uma cadeia cronológica verificável

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

## ⛓️ Deploy do Contrato

Antes de usar o Audita, você precisa fazer o deploy do contrato inteligente na rede Ethereum:

### Pré-requisitos
- Node.js e npm instalados
- Hardhat configurado
- Acesso a um nó Ethereum (local ou testnet)
- Conta com ETH para gas

### Deploy usando Hardhat
```bash


# Clone o repositório de contratos
git clone https://github.com/luizfelmach/audita.git
cd hardhat

# No diretório de contratos
npm install


# Deploy para rede local
npx hardhat run scripts/deploy.js --network localhost

# Deploy para testnet (ex: Sepolia)
npx hardhat run scripts/deploy.js --network sepolia
```

### Verificação do Deploy
```bash
# Verifique se o contrato foi deployado corretamente
npx hardhat verify --network sepolia ENDERECO_DO_CONTRATO
```

Após o deploy, anote o endereço do contrato para usar na configuração do Audita.

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

## 🎯 Uso Básico

### Enviando Logs para a Aplicação

O Audita recebe logs via API REST. Você pode enviar logs individuais ou em lote:

#### Log Individual
```bash
curl -X POST http://localhost:8080/api/v1/logs \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-01-15T14:30:25Z",
    "source": "firewall",
    "level": "info",
    "message": "ACCEPT TCP 192.168.1.105:45231 -> 8.8.8.8:53",
    "metadata": {
      "src_ip": "192.168.1.105",
      "src_port": "45231",
      "dst_ip": "8.8.8.8",
      "dst_port": "53",
      "protocol": "TCP",
      "action": "ACCEPT"
    }
  }'
```

#### Lote de Logs
```bash
curl -X POST http://localhost:8080/api/v1/logs/batch \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {
        "timestamp": "2024-01-15T14:25:10Z",
        "source": "radius",
        "level": "info",
        "message": "User joao.silva authenticated",
        "metadata": {
          "username": "joao.silva",
          "mac_address": "00:1B:44:11:3A:B7",
          "authentication_method": "PAP"
        }
      },
      {
        "timestamp": "2024-01-15T14:25:12Z",
        "source": "dhcp",
        "level": "info",
        "message": "IP assigned to device",
        "metadata": {
          "ip_address": "192.168.1.105",
          "mac_address": "00:1B:44:11:3A:B7",
          "lease_time": "86400"
        }
      }
    ]
  }'
```

### Identificando Quem Estava Logado

Para identificar quem estava usando um IP específico em determinado momento:

```bash
# Consulta por IP e timestamp
curl "http://localhost:8080/api/v1/correlation?ip=192.168.1.105&timestamp=2024-01-15T14:30:25Z"

# Resposta esperada:
{
  "user": "joao.silva",
  "ip_address": "192.168.1.105",
  "mac_address": "00:1B:44:11:3A:B7",
  "session_start": "2024-01-15T14:25:10Z",
  "confidence": "high",
  "sources": ["radius", "dhcp"]
}
```

#### Caso de Uso: Investigação de Acesso

Imagine que você detectou um acesso suspeito ao IP externo `malicious-site.com` às 14:30:25 do dia 15/01/2024, vindo do IP interno `192.168.1.105`. Para investigar:

1. **Consulte quem estava usando o IP**:
```bash
curl "http://localhost:8080/api/v1/correlation?ip=192.168.1.105&timestamp=2024-01-15T14:30:25Z"
```

2. **Obtenha o histórico completo do usuário**:
```bash
curl "http://localhost:8080/api/v1/user-activity?username=joao.silva&date=2024-01-15"
```

3. **Verifique logs de firewall relacionados**:
```bash
curl "http://localhost:8080/api/v1/logs?source=firewall&ip=192.168.1.105&timerange=2024-01-15T14:25:00Z,2024-01-15T14:35:00Z"
```

### Verificação de Integridade

O Audita permite verificar se os logs não foram alterados desde o registro:

#### Verificar Hash de um Lote
```bash
curl "http://localhost:8080/api/v1/integrity/batch/12345"

# Resposta:
{
  "batch_id": "12345",
  "blockchain_hash": "0xa1b2c3d4e5f6...",
  "local_hash": "0xa1b2c3d4e5f6...",
  "status": "valid",
  "block_number": 1234567,
  "timestamp": "2024-01-15T14:30:30Z"
}
```

#### Verificar Integridade de Período
```bash
curl "http://localhost:8080/api/v1/integrity/verify?start=2024-01-15T00:00:00Z&end=2024-01-15T23:59:59Z"

# Resposta:
{
  "period": "2024-01-15",
  "total_batches": 144,
  "verified_batches": 144,
  "invalid_batches": 0,
  "integrity_score": 100.0,
  "status": "valid"
}
```

## 🔌 Integração com Coletores de Logs

### Fluentd

Configure o Fluentd para enviar logs diretamente ao Audita:

```xml
<match audita.**>
  @type http
  endpoint http://localhost:8080/api/v1/logs/batch
  http_method post
  headers {"Content-Type": "application/json"}
  format json
  <buffer>
    @type file
    path /var/log/fluentd-buffers/audita
    flush_mode interval
    flush_interval 30s
    chunk_limit_size 1MB
  </buffer>
</match>
```

### Logstash

Pipeline do Logstash para o Audita:

```ruby
output {
  http {
    url => "http://localhost:8080/api/v1/logs/batch"
    http_method => "post"
    content_type => "application/json"
    format => "json"
    mapping => {
      "logs" => [
        {
          "timestamp" => "%{@timestamp}"
          "source" => "%{source}"
          "level" => "%{level}"
          "message" => "%{message}"
          "metadata" => "%{metadata}"
        }
      ]
    }
  }
}
```

### rsyslog

Configure o rsyslog para enviar logs via HTTP:

```
# /etc/rsyslog.conf
*.* @@localhost:8080/api/v1/logs

# Template para formato JSON
$template AuditaFormat,"{\"timestamp\":\"%timereported:::date-rfc3339%\",\"source\":\"syslog\",\"level\":\"%syslogseverity-text%\",\"message\":\"%msg%\",\"metadata\":{\"host\":\"%hostname%\",\"facility\":\"%syslogfacility-text%\"}}\n"

*.* @@localhost:8080/api/v1/logs;AuditaFormat
```

## 📊 Monitoramento com Prometheus (Bonus)

### Configurando Métricas

O Audita expõe métricas no endpoint `/metrics` para o Prometheus:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'audita'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: /metrics
    scrape_interval: 10s
```

### Principais Métricas Disponíveis

- `audita_logs_processed_total`: Total de logs processados
- `audita_blockchain_transactions_total`: Transações enviadas à blockchain
- `audita_correlation_requests_total`: Solicitações de correlação de usuário
- `audita_integrity_checks_total`: Verificações de integridade realizadas
- `audita_elasticsearch_indexing_duration`: Tempo de indexação no Elasticsearch
- `audita_queue_size`: Tamanho atual da fila de processamento

### Dashboard Grafana

Crie dashboards para visualizar:

1. **Volume de Logs**: Logs recebidos por fonte (firewall, DHCP, RADIUS)
2. **Performance**: Latência de processamento e indexação
3. **Integridade**: Status das verificações blockchain
4. **Correlações**: Número de consultas de identificação de usuário
5. **Alerts**: Falhas de integridade ou problemas de conectividade

### Docker Compose com Monitoramento

```yaml
version: '3.8'
services:
  audita:
    image: ghcr.io/luizfelmach/audita:latest
    ports:
      - "8080:8080"
    environment:
      - AUDITA_PROMETHEUS_ENABLED=true

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request
