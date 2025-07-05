use axum::extract::State;

use crate::context::Context;

pub async fn get_metrics(State(ctx): State<Context>) -> String {
    ctx.prom.batch_size.set(ctx.config.batch_size as f64);
    let gather = ctx.prom.gather();
    return gather;
}
