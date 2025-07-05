use prometheus::{Counter, Encoder, Gauge, Histogram, HistogramOpts, Registry, TextEncoder};
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct Prometheus {
    pub registry: Registry,

    pub docs_total: Arc<Counter>,
    pub batches_total: Arc<Counter>,

    pub batches_error_total: Arc<Counter>,
    pub storage_errors_total: Arc<Counter>,
    pub signer_errors_total: Arc<Counter>,

    pub worker_queue_size: Arc<Gauge>,
    pub storage_queue_size: Arc<Gauge>,
    pub signer_queue_size: Arc<Gauge>,
    pub batch_size: Arc<Gauge>,

    pub batch_processing_latency: Arc<Histogram>,
    pub storage_request_latency: Arc<Histogram>,
    pub signer_request_latency: Arc<Histogram>,
}

impl Prometheus {
    pub fn new() -> Self {
        let registry = Registry::new();

        let docs_total = Counter::new("app_docs_total", "Total number of documents processed").unwrap();
        let batches_total = Counter::new("app_batches_total", "Total number of batches processed").unwrap();
        let batches_error_total = Counter::new("app_batches_error_total", "Total number of batch processing errors").unwrap();
        let storage_errors_total = Counter::new("app_storage_errors_total", "Total number of storage errors").unwrap();
        let signer_errors_total = Counter::new("app_signer_errors_total", "Total number of signer errors").unwrap();

        let worker_queue_size = Gauge::new("app_worker_queue_size", "Current size of the worker queue").unwrap();
        let storage_queue_size = Gauge::new("app_storage_queue_size", "Current size of the storage queue").unwrap();
        let signer_queue_size = Gauge::new("app_signer_queue_size", "Current size of the signer queue").unwrap();
        let batch_size = Gauge::new("app_batch_size", "Size of the last processed batch").unwrap();

        let latency_buckets = vec![0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0];

        let batch_processing_latency = Histogram::with_opts(
            HistogramOpts::new("app_batch_processing_latency_seconds", "Batch processing latency in seconds")
                .buckets(latency_buckets.clone()),
        )
        .unwrap();

        let storage_request_latency = Histogram::with_opts(
            HistogramOpts::new("app_storage_request_latency_seconds", "Storage request latency in seconds")
                .buckets(latency_buckets.clone()),
        )
        .unwrap();

        let signer_request_latency = Histogram::with_opts(
            HistogramOpts::new("app_signer_request_latency_seconds", "Signer request latency in seconds").buckets(latency_buckets),
        )
        .unwrap();

        registry.register(Box::new(docs_total.clone())).unwrap();
        registry.register(Box::new(batches_total.clone())).unwrap();
        registry.register(Box::new(batches_error_total.clone())).unwrap();
        registry.register(Box::new(storage_errors_total.clone())).unwrap();
        registry.register(Box::new(signer_errors_total.clone())).unwrap();

        registry.register(Box::new(worker_queue_size.clone())).unwrap();
        registry.register(Box::new(storage_queue_size.clone())).unwrap();
        registry.register(Box::new(signer_queue_size.clone())).unwrap();
        registry.register(Box::new(batch_size.clone())).unwrap();

        registry.register(Box::new(batch_processing_latency.clone())).unwrap();
        registry.register(Box::new(storage_request_latency.clone())).unwrap();
        registry.register(Box::new(signer_request_latency.clone())).unwrap();

        Self {
            registry,

            docs_total: Arc::new(docs_total),
            batches_total: Arc::new(batches_total),

            batches_error_total: Arc::new(batches_error_total),
            storage_errors_total: Arc::new(storage_errors_total),
            signer_errors_total: Arc::new(signer_errors_total),

            worker_queue_size: Arc::new(worker_queue_size),
            storage_queue_size: Arc::new(storage_queue_size),
            signer_queue_size: Arc::new(signer_queue_size),
            batch_size: Arc::new(batch_size),

            batch_processing_latency: Arc::new(batch_processing_latency),
            storage_request_latency: Arc::new(storage_request_latency),
            signer_request_latency: Arc::new(signer_request_latency),
        }
    }

    pub fn gather(&self) -> String {
        let encoder = TextEncoder::new();
        let metric_families = self.registry.gather();
        let mut buffer = Vec::new();
        encoder.encode(&metric_families, &mut buffer).unwrap();
        String::from_utf8(buffer).unwrap()
    }
}
