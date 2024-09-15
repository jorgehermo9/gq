use crate::fixtures::products;
use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

mod equal;

#[rstest]
fn filter_and_accessing(products: Value) {
    let query: Query = r#"products(quantity<5).name"#.parse().unwrap();
    let expected = json!(["Product 3"]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}
