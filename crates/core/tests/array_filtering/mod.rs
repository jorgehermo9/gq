use crate::fixtures::products;
use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

mod equal;

#[rstest]
fn filter_and_accessing(products: Value) {
    let query: Query = r#"products(quantity < 5).name"#.parse().unwrap();
    let expected = json!(["Product 3"]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn multiple_arguments(products: Value) {
    let query: Query = r#"products(quantity > 4, price > 10.0)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "Product 2",
          "quantity": 5,
          "price": 14.95
        }
    ]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected)
}

#[test]
fn nested_field() {
    let value = json!({
        "products":[
            {
                "name": "Product 1",
                "price": {
                    "currency":"EUR",
                    "value": 100
                }
            },
            {
                "name": "Product 2",
                "price": {
                    "currency":"DOLLAR",
                    "value": 100
                }
            },
            {
                "name": "Product 3",
                "price": {
                    "currency":"POUNDS",
                    "value": 100
                }
            }
        ]
    });
    let query: Query = r#"products(price.currency = "EUR")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "Product 1",
            "price": {
                "currency":"EUR",
                "value": 100
            }
        }
    ]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[test]
fn root_filtering() {
    let value = json!([
        {
            "name": "Product 1",
            "kind": "DRESS"
        },
        {
            "name": "Product 2",
            "kind": "JEANS"
        },
        {
            "name": "Product 3",
            "kind": "JACKET"
        },
    ]);
    let query: Query = r#"(kind = "JACKET")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "Product 3",
            "kind": "JACKET"
        }
    ]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[test]
fn root_filtering_and_accessing() {
    let value = json!([
        {
            "name": "Product 1",
            "kind": "DRESS"
        },
        {
            "name": "Product 2",
            "kind": "JEANS"
        },
        {
            "name": "Product 3",
            "kind": "JACKET"
        },
    ]);
    let query: Query = r#"(kind = "JACKET")name"#.parse().unwrap();
    let expected = json!(["Product 3",]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[test]
fn root_filtering_nested_field() {
    let value = json!([
        {
            "name": "Product 1",
            "price": {
                "currency":"EUR",
                "value": 100
            }
        },
        {
            "name": "Product 2",
            "price": {
                "currency":"DOLLAR",
                "value": 100
            }
        },
        {
            "name": "Product 3",
            "price": {
                "currency":"POUNDS",
                "value": 100
            }
        }
    ]);
    let query: Query = r#"(price.currency = "EUR")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "Product 1",
            "price": {
                "currency":"EUR",
                "value": 100
            }
        }
    ]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[test]
fn root_filtering_nested_field_and_accessing() {
    let value = json!([
        {
            "name": "Product 1",
            "price": {
                "currency":"EUR",
                "value": 100
            }
        },
        {
            "name": "Product 2",
            "price": {
                "currency":"DOLLAR",
                "value": 100
            }
        },
        {
            "name": "Product 3",
            "price": {
                "currency":"POUNDS",
                "value": 100
            }
        }
    ]);
    let query: Query = r#"(price.currency = "EUR")price.value"#.parse().unwrap();
    let expected = json!([100]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}
