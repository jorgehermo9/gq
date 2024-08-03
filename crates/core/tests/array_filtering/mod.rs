use crate::fixtures::products;
use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

#[rstest]
fn exact_match(products: Value) {
    let query: Query = r#"products(name="Product 2")"#.parse().unwrap();
    let expected = json!([
      {
        "name": "Product 2",
        "quantity": 5,
        "price": 14.95
      }
    ]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn numeric_condition(products: Value) {
    let query: Query = r#"products(quantity>=5)"#.parse().unwrap();
    let expected = json!([
      {
        "name": "Product 1",
        "quantity": 8,
        "price": 9.95
      },
      {
        "name": "Product 2",
        "quantity": 5,
        "price": 14.95
      }
    ]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn regex_match(products: Value) {
    let query: Query = r#"products(name~".*3$")"#.parse().unwrap();
    let expected = json!([
      {
        "name": "Product 3",
        "quantity": 4,
        "price": 24.95
      }
    ]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn filter_and_accessing(products: Value) {
    let query: Query = r#"products(quantity<5).name"#.parse().unwrap();
    let expected = json!(["Product 3"]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}
