use crate::context::Context;
use crate::presentation::handlers::ui::ui;
use crate::presentation::routes;
use anyhow::{Ok, Result};
use axum::Router;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tower_http::normalize_path::NormalizePathLayer;

pub async fn run(ctx: Arc<Context>) -> Result<()> {
    let url = url(ctx.config.host.clone(), ctx.config.port);
    let listener = TcpListener::bind(url).await?;
    let app = router(ctx.clone());
    axum::serve(listener, app).await?;
    Ok(())
}

fn router(ctx: Arc<Context>) -> Router {
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    Router::new()
        .nest("/api", routes::api())
        .fallback(ui)
        .layer(cors)
        .layer(NormalizePathLayer::trim_trailing_slash())
        .with_state((*ctx).clone())
}

pub fn url(host: String, port: u16) -> String {
    format!("{}:{}", host, port)
}
