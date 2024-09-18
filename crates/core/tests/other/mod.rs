use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

use crate::fixtures::products;

// TODO: add advanced usage complicated test

#[rstest]
fn filtering_accessing_and_aliasing(products: Value) {
    let query: Query = r#"{
        products(price < 15.00).name: cheap
        products(price >= 15.00).name: expensive
    }"#
    .parse()
    .unwrap();
    let expected = json!({
        "cheap": ["Product 1", "Product 2"],
        "expensive": ["Product 3"]
    });

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}
