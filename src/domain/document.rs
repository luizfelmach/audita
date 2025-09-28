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
    pub ip: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DhcpDocument {
    pub mac: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RadiusDocument {
    pub user: String,
}
