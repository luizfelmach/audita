use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum Document {
    #[serde(rename = "fw")]
    Firewall(FirewallDocument),

    #[serde(rename = "dhcp")]
    Dhcp(DhcpDocument),

    #[serde(rename = "radius")]
    Radius(RadiusDocument),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FirewallDocument {
    pub dst_ip: String,
    pub dst_port: usize,
    pub dst_mapped_ip: String,
    pub dst_mapped_port: usize,

    pub src_ip: String,
    pub src_port: usize,
    pub src_mapped_ip: String,
    pub src_mapped_port: usize,

    pub timestamp: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DhcpDocument {
    pub ip: String,
    pub mac: String,
    pub lease_time: usize,
    pub timestamp: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RadiusDocument {
    pub mac: String,
    pub username: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StorableDocument {
    #[serde(rename = "audita_id")]
    pub id: String,
    #[serde(rename = "audita_ord")]
    pub ord: usize,

    #[serde(flatten)]
    pub document: Document,
}

impl StorableDocument {
    pub fn new(id: impl Into<String>, ord: usize, document: Document) -> Self {
        Self { id: id.into(), ord, document }
    }

    pub fn timestamp(&self) -> DateTime<Utc> {
        match &self.document {
            Document::Firewall(c) => c.timestamp,
            Document::Dhcp(c) => c.timestamp,
            Document::Radius(c) => c.timestamp,
        }
    }

    pub fn as_firewall(&self) -> Option<&FirewallDocument> {
        self.document.as_firewall()
    }

    pub fn as_dhcp(&self) -> Option<&DhcpDocument> {
        self.document.as_dhcp()
    }
}

impl Document {
    pub fn as_firewall(&self) -> Option<&FirewallDocument> {
        if let Document::Firewall(ref firewall) = self {
            Some(firewall)
        } else {
            None
        }
    }

    pub fn as_dhcp(&self) -> Option<&DhcpDocument> {
        if let Document::Dhcp(ref dhcp) = self {
            Some(dhcp)
        } else {
            None
        }
    }
}
