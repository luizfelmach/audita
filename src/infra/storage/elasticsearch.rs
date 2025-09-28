use crate::domain::{Batch, Condition, Document, Hasher, Operator, Query, StorableDocument, StorageRepository};
use anyhow::{bail, Ok, Result};
use async_trait::async_trait;
use chrono::Local;
use elasticsearch::{
    auth::Credentials,
    cert::CertificateValidation,
    http::transport::{SingleNodeConnectionPool, TransportBuilder},
    BulkOperation, BulkParts, Elasticsearch, SearchParts,
};
use serde::Deserialize;
use serde_json::{json, Map, Value};
use std::sync::Arc;

#[derive(Debug, Deserialize)]
struct EsHit<T> {
    _source: T,
    sort: Option<Vec<serde_json::Value>>,
}

#[derive(Debug, Deserialize)]
struct EsHits<T> {
    hits: Vec<EsHit<T>>,
}

#[derive(Debug, Deserialize)]
struct EsResponse<T> {
    hits: EsHits<T>,
}

#[derive(Clone)]
pub struct ElasticsearchStorageRepository {
    client: Elasticsearch,
    indices_pattern: String,
    hasher: Arc<dyn Hasher>,
}

impl ElasticsearchStorageRepository {
    pub fn new(url: String, username: String, password: String, indices_pattern: String, hasher: Arc<dyn Hasher>) -> Result<Self> {
        let pool = SingleNodeConnectionPool::new(url.parse()?);
        let credentials = Credentials::Basic(username, password);
        let transport = TransportBuilder::new(pool).auth(credentials).cert_validation(CertificateValidation::None).build()?;

        Ok(Self { client: Elasticsearch::new(transport), indices_pattern, hasher })
    }

    fn condition_to_query(&self, cond: &Condition) -> Value {
        let field = &cond.field;
        let query = match &cond.op {
            Operator::EqString(val) => json!({ "term": { format!("{field}.keyword"): val } }),
            Operator::NeqString(val) => json!({ "bool": { "must_not": { "term": { field: val } } } }),
            Operator::Contains(val) => json!({ "wildcard": { field: format!("*{}*", val) } }),
            Operator::StartsWith(val) => json!({ "prefix": { field: val } }),
            Operator::EndsWith(val) => json!({ "wildcard": { field: format!("*{}", val) } }),
            Operator::Regex(val) => json!({ "regexp": { field: val } }),
            Operator::EqInt(val) => json!({ "term": { field: val } }),
            Operator::NeqInt(val) => json!({ "bool": { "must_not": { "term": { field: val } } } }),
            Operator::GtInt(val) => json!({ "range": { field: { "gt": val } } }),
            Operator::LtInt(val) => json!({ "range": { field: { "lt": val } } }),
            Operator::BetweenInt(min, max) => json!({ "range": { field: { "gte": min, "lte": max } } }),
            Operator::EqDate(dt) => json!({ "term": { field: dt.to_rfc3339() } }),
            Operator::NeqDate(dt) => json!({ "bool": { "must_not": { "term": { field: dt.to_rfc3339() } } } }),
            Operator::AfterDate(dt) => json!({ "range": { field: { "gt": dt.to_rfc3339() } } }),
            Operator::BeforeDate(dt) => json!({ "range": { field: { "lt": dt.to_rfc3339() } } }),
            Operator::BetweenDate(start, end) => json!({ "range": { field: { "gte": start.to_rfc3339(), "lte": end.to_rfc3339() } } }),
        };
        return query;
    }

    fn parse_query(&self, query: &Query) -> Value {
        let and_empty = query.and.as_ref().map_or(true, |v| v.is_empty());
        let or_empty = query.or.as_ref().map_or(true, |v| v.is_empty());
        let not_empty = query.not.as_ref().map_or(true, |v| v.is_empty());

        if and_empty && or_empty && not_empty {
            return json!({ "match_all": {} });
        }

        let mut must = vec![];
        let mut should = vec![];
        let mut must_not = vec![];

        if let Some(and_conds) = &query.and {
            for cond in and_conds {
                must.push(self.condition_to_query(cond));
            }
        }

        if let Some(or_conds) = &query.or {
            for cond in or_conds {
                should.push(self.condition_to_query(cond));
            }
        }

        if let Some(not_conds) = &query.not {
            for cond in not_conds {
                must_not.push(self.condition_to_query(cond));
            }
        }

        let mut bool_query = json!({ "bool": {} });

        if !must.is_empty() {
            bool_query["bool"]["must"] = json!(must);
        }
        if !should.is_empty() {
            bool_query["bool"]["should"] = json!(should);
            bool_query["bool"]["minimum_should_match"] = json!(1);
        }
        if !must_not.is_empty() {
            bool_query["bool"]["must_not"] = json!(must_not);
        }

        return bool_query;
    }
}

#[async_trait]
impl StorageRepository for ElasticsearchStorageRepository {
    async fn store(&self, batch: &Batch) -> Result<()> {
        let mut ops: Vec<BulkOperation<Map<String, Value>>> = Vec::new();
        let index = Local::now().format(&self.indices_pattern).to_string();

        for (i, doc) in batch.documents.iter().enumerate() {
            let elastic_doc = StorableDocument::new(batch.id.clone(), i, doc.clone());
            let json_doc: Map<String, Value> = serde_json::to_value(elastic_doc)?.as_object().cloned().unwrap_or_default();
            ops.push(BulkOperation::create(json_doc).index(&index).into());
        }

        let response = self.client.bulk(BulkParts::None).body(ops).send().await?;
        let status = response.status_code();

        if !response.status_code().is_success() {
            let error_body: Value = response.json().await?;
            bail!("bulk insert request failed with status {}: {}", status, error_body);
        }

        Ok(())
    }

    async fn retrieve(&self, id: &String) -> Result<Option<Batch>> {
        let query = Query {
            and: Some(vec![Condition { field: "audita_id".to_string(), op: Operator::EqString(id.to_string()) }]),
            ..Default::default()
        };

        let documents: Vec<Document> = self.search(&query).await?.into_iter().map(|dq| dq.document).collect();

        if documents.is_empty() {
            return Ok(None);
        }

        let digest = self.hasher.digest(&documents)?;

        Ok(Some(Batch { id: id.to_string(), documents, digest }))
    }

    async fn search(&self, query: &Query) -> Result<Vec<StorableDocument>> {
        let query = self.parse_query(query);

        let mut results = Vec::new();
        let mut after: Option<Vec<serde_json::Value>> = None;

        loop {
            let mut search = json!({
                "query": query,
                "sort": [{ "audita_ord": "asc" }],
                "size": 10_000
            });

            if let Some(values) = &after {
                search["search_after"] = json!(values);
            }

            let response = self.client.search(SearchParts::None).body(search).send().await?;

            let body: EsResponse<StorableDocument> = response.json().await?;

            if body.hits.hits.is_empty() {
                break;
            }

            for hit in body.hits.hits.iter() {
                let es_doc = hit._source.clone();
                results.push(es_doc);
            }

            after = body.hits.hits.last().and_then(|h| h.sort.clone());
        }

        Ok(results)
    }
}
