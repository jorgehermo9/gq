use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

use crate::fixtures::{ai_models, products, programming_languages};

#[rstest]
fn integer_argument_value(products: Value) {
    let query: Query = r#"products(quantity <= 5)"#.parse().unwrap();
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
fn float_argument_value(products: Value) {
    let query: Query = r#"products(price <= 14.95)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "Product 1",
          "quantity": 8,
          "price": 9.95,
        },
        {
          "name": "Product 2",
          "quantity": 5,
          "price": 14.95
        },
    ]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn float_argument_value_with_null_field_value(ai_models: Value) {
    let query: Query = r#"models(score <= 71.49)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "GPT-4O",
          "openSource": false,
          "score": 71.49,
          "tags": ["NLP", "Text Generation"]
        },
    ]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

// At least one of the values in the array field must be greater than the argument value
// TODO: This test is broken because the <= operation is modeled
// as the negation of the > operation. We should implement <= independently
// This is the same problem as in the greater_equal or not_equal operations
// #[rstest]
// fn array_field_value_includes_greater_than_argument_value() {
//     let value = json!({
//         "products":[
//             {
//                 "name": "Product 1",
//                 "scores": [1, 2, 3, 4]
//             },
//             {
//                 "name": "Product 2",
//                 "scores": [4, 5, 6]
//             },
//         ]
//     });
//     let query: Query = r#"products(scores <= 3)"#.parse().unwrap();
//     let expected = json!([
//         {
//             "name": "Product 1",
//             "scores": [1, 2, 3]
//         },
//     ]);

//     let result = query.apply(value).unwrap();

//     assert_eq!(result, expected);
// }

#[rstest]
fn multiple_arguments(products: Value) {
    let query: Query = r#"products(quantity <= 5, price <= 14.95)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "Product 2",
          "quantity": 5,
          "price": 14.95
        },
    ]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn query_argument_value_greather_than_all_values(programming_languages: Value) {
    let query: Query = r#"languages(year <= 1994)"#.parse().unwrap();
    let expected = json!([]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

// TODO: Assert that a warning is logged with the proper message
#[rstest]
fn missing_field(programming_languages: Value) {
    let query: Query = r#"languages(missing_field <= 5)"#.parse().unwrap();
    let expected = json!([]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

// TODO: assert that a warning is logged with the proper message
#[rstest]
fn incompatible_operation_error(programming_languages: Value) {
    let query: Query = r#"languages(name <= 1995)"#.parse().unwrap();
    let expected = json!([]);
    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}
