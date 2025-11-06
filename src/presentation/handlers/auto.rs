use crate::{
    context::Context,
    domain::{Condition, Operator, Query, StorableDocument},
    presentation::error::{AppError, HttpResult},
};
use axum::{extract::State, Json};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct AutoSearchRequest {
    pub ip: String,
    pub port: usize,
    pub timestamp: DateTime<Utc>,
    pub delta: i64,
}

#[derive(Serialize, Deserialize)]
pub struct AutoResponse {
    pub firewall: Option<StorableDocument>,
    pub dhcp: Option<StorableDocument>,
    pub radius: Option<StorableDocument>,
}

fn build_firewall_query(ip: &str, port: usize, timestamp: DateTime<Utc>, delta: i64) -> Query {
    let start_time = timestamp + Duration::minutes(-delta);
    let end_time = timestamp + Duration::minutes(delta);

    Query {
        and: Some(vec![
            Condition { field: "src_mapped_ip".to_string(), op: Operator::EqString(ip.to_string()) },
            Condition { field: "type".to_string(), op: Operator::EqString("fw".into()) },
            Condition { field: "src_mapped_port".to_string(), op: Operator::EqInt(port as i64) },
            Condition { field: "timestamp".to_string(), op: Operator::BetweenDate(start_time, end_time) },
        ]),
        ..Default::default()
    }
}

fn build_dhcp_query(ip: &str, reference_time: DateTime<Utc>) -> Query {
    let start_time = reference_time + Duration::minutes(-10);
    let end_time = reference_time;

    Query {
        and: Some(vec![
            Condition { field: "ip".to_string(), op: Operator::EqString(ip.to_string()) },
            Condition { field: "type".to_string(), op: Operator::EqString("dhcp".into()) },
            Condition { field: "timestamp".to_string(), op: Operator::BetweenDate(start_time, end_time) },
        ]),
        ..Default::default()
    }
}

fn build_radius_query(mac: &str, reference_time: DateTime<Utc>) -> Query {
    let start_time = reference_time + Duration::minutes(-10);
    let end_time = reference_time;

    Query {
        and: Some(vec![
            Condition { field: "mac".to_string(), op: Operator::EqString(mac.to_string()) },
            Condition { field: "type".to_string(), op: Operator::EqString("radius".into()) },
            Condition { field: "timestamp".to_string(), op: Operator::BetweenDate(start_time, end_time) },
        ]),
        ..Default::default()
    }
}

pub async fn auto_search(State(ctx): State<Context>, Json(req): Json<AutoSearchRequest>) -> HttpResult<Json<AutoResponse>> {
    let AutoSearchRequest { ip, port, timestamp, delta } = req;

    let fw_query = build_firewall_query(&ip, port, timestamp, delta);

    let fw_docs = ctx.storage.search(&fw_query).await.map_err(|e| AppError::Internal(e))?;

    let fw_doc = fw_docs.into_iter().min_by_key(|d| (d.timestamp() - timestamp).num_milliseconds().abs());

    let dhcp_doc = if let Some(fw_doc_ref) = &fw_doc {
        let fw_doc = fw_doc_ref.as_firewall().unwrap();
        let fw_time = fw_doc_ref.timestamp();
        let dhcp_query = build_dhcp_query(&fw_doc.src_ip, fw_time);
        let dhcp_docs = ctx.storage.search(&dhcp_query).await.ok();
        dhcp_docs.and_then(|docs| docs.into_iter().min_by_key(|d| (d.timestamp() - fw_time).num_milliseconds().abs()))
    } else {
        None
    };

    let radius_doc = if let Some(dhcp_ref) = &dhcp_doc {
        let dhcp_mac = to_dhcp(dhcp_ref).and_then(|d| Some(d.mac.clone()));
        if let Some(mac) = dhcp_mac {
            let dhcp_time = dhcp_ref.timestamp();
            let radius_query = build_radius_query(&mac, dhcp_time);
            let radius_docs = ctx.storage.search(&radius_query).await.ok();
            radius_docs.and_then(|docs| docs.into_iter().min_by_key(|d| (d.timestamp() - dhcp_time).num_milliseconds().abs()))
        } else {
            None
        }
    } else {
        None
    };

    Ok(Json(AutoResponse { firewall: fw_doc, dhcp: dhcp_doc, radius: radius_doc }))
}

fn to_dhcp(doc: &StorableDocument) -> Option<&crate::domain::DhcpDocument> {
    doc.as_dhcp()
}
