use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

use crate::fixtures::products;

#[rstest]
fn single_indexing(products: Value) {
    let query: Query = "products[0]".parse().unwrap();
    let expected = json!({
        "name": "Product 1",
        "quantity": 8,
        "price": 9.95,
    });

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn range_indexing(products: Value) {
    let query: Query = "products[1..2]".parse().unwrap();
    let expected = json!([
        {
          "name": "Product 2",
          "quantity": 5,
          "price": 14.95
        },
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
fn consecutive_single_indexing() {
    let value = json!({
        "items":[
            [
                {"name":"Product 1", "quantity": 8, "price": 9.95},
                {"name":"Product 2", "quantity": 5, "price": 14.95},
                {"name":"Product 3", "quantity": 4, "price": 24.95}
            ],
            [
                {"name":"Product 4", "quantity": 8, "price": 9.95},
                {"name":"Product 5", "quantity": 5, "price": 14.95},
                {"name":"Product 6", "quantity": 4, "price": 24.95}
            ]
        ]
    });
    let query: Query = "items[0][1]".parse().unwrap();
    let expected = json!({
        "name":"Product 2",
        "quantity": 5,
        "price": 14.95
    });

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn consecutive_range_indexing() {
    let value = json!({
        "items":[
            [
                {"name":"Product 1", "quantity": 8, "price": 9.95},
                {"name":"Product 2", "quantity": 5, "price": 14.95},
                {"name":"Product 3", "quantity": 4, "price": 24.95}
            ],
            [
                {"name":"Product 4", "quantity": 8, "price": 9.95},
                {"name":"Product 5", "quantity": 5, "price": 14.95},
                {"name":"Product 6", "quantity": 4, "price": 24.95}
            ]
        ]
    });
    let query: Query = "items[0][1..2]".parse().unwrap();
    let expected = json!([
        {
            "name":"Product 2",
            "quantity": 5,
            "price": 14.95
        },
        {
            "name":"Product 3",
            "quantity": 4,
            "price": 24.95
        }
    ]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn root_single_indexing() {
    let value = json!([
        {"name":"Product 1", "quantity": 8, "price": 9.95},
        {"name":"Product 2", "quantity": 5, "price": 14.95},
        {"name":"Product 3", "quantity": 4, "price": 24.95}
    ]);
    let query: Query = "[1]".parse().unwrap();
    let expected = json!({
        "name":"Product 2",
        "quantity": 5,
        "price": 14.95
    });

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn root_range_indexing() {
    let value = json!([
        {"name":"Product 1", "quantity": 8, "price": 9.95},
        {"name":"Product 2", "quantity": 5, "price": 14.95},
        {"name":"Product 3", "quantity": 4, "price": 24.95}
    ]);
    let query: Query = "[1..2]".parse().unwrap();
    let expected = json!([
        {
            "name":"Product 2",
            "quantity": 5,
            "price": 14.95
        },
        {
            "name":"Product 3",
            "quantity": 4,
            "price": 24.95
        }
    ]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}
