use crate::context::Context;
use crate::presentation::handlers::auditing::{search_dhcp, search_firewall, search_radius};
use crate::presentation::handlers::auto::auto_search;
use axum::{routing::post, Router};

pub fn routes() -> Router<Context> {
    Router::new()
        .route("/firewall", post(search_firewall))
        .route("/dhcp", post(search_dhcp))
        .route("/radius", post(search_radius))
        .route("/auto", post(auto_search))
}
