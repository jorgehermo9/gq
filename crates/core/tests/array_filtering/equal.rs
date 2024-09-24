use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

use crate::fixtures::{ai_models, products, programming_languages};

#[rstest]
fn string_argument_value(programming_languages: Value) {
    let query: Query = r#"languages(name = "JavaScript")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "JavaScript",
            "popular": true,
            "year": 1995
        }
    ]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn integer_argument_value(programming_languages: Value) {
    let query: Query = r#"languages(year = 1995)"#.parse().unwrap();
    let expected = json!([
        {
            "name": "JavaScript",
            "popular": true,
            "year": 1995
        },
        {
            "name": "Java",
            "popular": false,
            "year": 1995
        }
    ]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn float_argument_value(products: Value) {
    let query: Query = r#"products(price = 14.95)"#.parse().unwrap();
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
fn boolean_argument_value(programming_languages: Value) {
    let query: Query = r#"languages(popular = true)"#.parse().unwrap();
    let expected = json!([
        {
            "name": "JavaScript",
            "popular": true,
            "year": 1995
        },
        {
            "name": "Rust",
            "popular": true,
            "year": 2010
        }
    ]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn null_argument_value(ai_models: Value) {
    let query: Query = r#"models(score = null)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "Claude",
          "openSource": false,
          "score": null
        }
    ]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn float_argument_value_with_null_field_value(ai_models: Value) {
    let query: Query = r#"models(score = 88.7)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "LLAMA",
          "openSource": true,
          "score": 88.7,
          "tags": ["Text Generation", "Open Source"]
        }
    ]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn array_field_value_includes_argument_value(ai_models: Value) {
    let query: Query = r#"models(tags = "NLP")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "GPT-4O",
            "openSource": false,
            "score": 71.49,
            "tags": ["NLP", "Text Generation"]
        }
    ]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

// TODO: decide if its ok to test this here or it is enough testing it in the parent module
#[rstest]
fn multiple_arguments(programming_languages: Value) {
    let query: Query = r#"languages(popular = true, year = 1995)"#.parse().unwrap();
    let expected = json!([
        {
            "name": "JavaScript",
            "popular": true,
            "year": 1995
        }
    ]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn value_not_found(programming_languages: Value) {
    let query: Query = r#"languages(name = "value_not_found")"#.parse().unwrap();
    let expected = json!([]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

// TODO: Assert that a warning is logged
#[rstest]
fn missing_field(programming_languages: Value) {
    let query: Query = r#"languages(missing_field = 5)"#.parse().unwrap();
    let expected = json!([]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

// TODO: assert that a warning is logged
#[rstest]
fn incompatible_argument_type(programming_languages: Value) {
    let query: Query = r#"languages(name = 1995)"#.parse().unwrap();
    let expected = json!([]);
    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}
