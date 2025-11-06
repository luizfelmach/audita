use crate::{
    context::Context,
    domain::{Condition, Operator, Query, StorableDocument},
    presentation::error::{AppError, HttpResult},
};
use axum::{extract::State, Json};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct SearchFirewallRequest {
    pub ip: String,
    pub port: usize,
    pub timestamp: DateTime<Utc>,
    pub delta: i64,
}

#[derive(Serialize, Deserialize)]
pub struct SearchDhcpRequest {
    pub ip: String,
    pub timestamp: DateTime<Utc>,
    pub delta: i64,
}

#[derive(Serialize, Deserialize)]
pub struct SearchRadiusRequest {
    pub mac: String,
    pub timestamp: DateTime<Utc>,
    pub delta: i64,
}

#[derive(Serialize, Deserialize)]
pub struct SearchResponse {
    pub documents: Vec<StorableDocument>,
}

#[derive(Serialize, Deserialize)]
pub struct AutoResponse {
    pub firewall: StorableDocument,
    pub dhcp: StorableDocument,
    pub radius: StorableDocument,
}

pub async fn search_firewall(State(ctx): State<Context>, Json(req): Json<SearchFirewallRequest>) -> HttpResult<Json<SearchResponse>> {
    let SearchFirewallRequest { ip, port, timestamp, delta } = req;

    let query = build_firewall_query(&ip, port, timestamp, delta);

    let documents = ctx.storage.search(&query).await.map_err(|e| AppError::Internal(e))?;

    Ok(Json(SearchResponse { documents }))
}

pub async fn search_dhcp(State(ctx): State<Context>, Json(req): Json<SearchDhcpRequest>) -> HttpResult<Json<SearchResponse>> {
    let SearchDhcpRequest { ip, timestamp, delta } = req;

    let query = build_dhcp_query(&ip, timestamp, delta);

    let documents = ctx.storage.search(&query).await.map_err(|e| AppError::Internal(e))?;

    Ok(Json(SearchResponse { documents }))
}

pub async fn search_radius(State(ctx): State<Context>, Json(req): Json<SearchRadiusRequest>) -> HttpResult<Json<SearchResponse>> {
    let SearchRadiusRequest { mac, timestamp, delta } = req;

    let query = build_radius_query(&mac, timestamp, delta);

    let documents = ctx.storage.search(&query).await.map_err(|e| AppError::Internal(e))?;

    Ok(Json(SearchResponse { documents }))
}

pub fn build_firewall_query(ip: &str, port: usize, timestamp: DateTime<Utc>, delta: i64) -> Query {
    let start_time = timestamp + Duration::minutes(-delta);
    let end_time = timestamp + Duration::minutes(delta);

    Query {
        and: Some(vec![
            Condition { field: "src_mapped_ip".to_string(), op: Operator::EqString(ip.to_string()) },
            Condition { field: "src_mapped_port".to_string(), op: Operator::EqInt(port as i64) },
            Condition { field: "type".to_string(), op: Operator::EqString("fw".into()) },
            Condition { field: "timestamp".to_string(), op: Operator::BetweenDate(start_time, end_time) },
        ]),
        ..Default::default()
    }
}

pub fn build_dhcp_query(ip: &str, timestamp: DateTime<Utc>, delta: i64) -> Query {
    let start_time = timestamp + Duration::minutes(-delta);
    let end_time = timestamp + Duration::minutes(delta);

    Query {
        and: Some(vec![
            Condition { field: "ip".to_string(), op: Operator::EqString(ip.to_string()) },
            Condition { field: "type".to_string(), op: Operator::EqString("dhcp".into()) },
            Condition { field: "timestamp".to_string(), op: Operator::BetweenDate(start_time, end_time) },
        ]),
        ..Default::default()
    }
}

pub fn build_radius_query(mac: &str, timestamp: DateTime<Utc>, delta: i64) -> Query {
    let start_time = timestamp + Duration::minutes(-delta);
    let end_time = timestamp + Duration::minutes(delta);

    Query {
        and: Some(vec![
            Condition { field: "mac".to_string(), op: Operator::EqString(mac.to_string()) },
            Condition { field: "type".to_string(), op: Operator::EqString("radius".into()) },
            Condition { field: "timestamp".to_string(), op: Operator::BetweenDate(start_time, end_time) },
        ]),
        ..Default::default()
    }
}
