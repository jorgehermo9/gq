use crate::fixtures::{ai_models, products, programming_languages};
use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

#[rstest]
fn contains(programming_languages: Value) {
    let query: Query = r#"languages(name !~ "Java")"#.parse().unwrap();
    let expected = json!([
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
fn starts_with(programming_languages: Value) {
    let query: Query = r#"languages(name !~ "^Java")"#.parse().unwrap();
    let expected = json!([
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
fn ends_with(programming_languages: Value) {
    let query: Query = r#"languages(name !~ "Script$")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "Java",
            "popular": false,
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
fn starts_with_and_ends_with(programming_languages: Value) {
    let query: Query = r#"languages(name !~ "^JavaScript$")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "Java",
            "popular": false,
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
fn case_insensitive(programming_languages: Value) {
    let query: Query = r#"languages(name !~ "(?i)jAVA")"#.parse().unwrap();
    let expected = json!([
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
fn case_sensitive(programming_languages: Value) {
    let query: Query = r#"languages(name !~ "jAVA")"#.parse().unwrap();
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
fn digit(products: Value) {
    let query: Query = r#"products(name !~ "Product \\d")"#.parse().unwrap();
    let expected = json!([]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn character_classes(products: Value) {
    let query: Query = r#"products(name !~ "Product [12]")"#.parse().unwrap();
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
fn negated_character_classes(products: Value) {
    let query: Query = r#"products(name !~ "Product [^12]")"#.parse().unwrap();
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
fn range_character_classes(products: Value) {
    let query: Query = r#"products(name !~ "Product [1-2]")"#.parse().unwrap();
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
fn or(products: Value) {
    let query: Query = r#"products(name !~ "Product 1|Product 2")"#.parse().unwrap();
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
fn grouped_or(products: Value) {
    let query: Query = r#"products(name !~ "Product (1|2)")"#.parse().unwrap();
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
fn wildcard(products: Value) {
    let query: Query = r#"products(name !~ "Product .*")"#.parse().unwrap();
    let expected = json!([]);

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn repetition_quantifier() {
    let value = json!({
        "products": [
            {
                "name": "Product 1",
                "quantity": 8,
                "price": 9.95
            },
            {
              "name": "Product 10",
              "quantity": 8,
              "price": 9.95
            },
            {
              "name": "Product 20",
              "quantity": 5,
              "price": 14.95
            }
        ]
    });
    let query: Query = r#"products(name !~ "Product \\d{2}")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "Product 1",
            "quantity": 8,
            "price": 9.95
        },
    ]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn repetition_quantifier_range() {
    let value = json!({
        "products": [
            {
                "name": "Product ",
                "quantity": 8,
                "price": 9.95
            },
            {
                "name": "Product 1",
                "quantity": 8,
                "price": 9.95
            },
            {
              "name": "Product 10",
              "quantity": 8,
              "price": 9.95
            },
            {
              "name": "Product 20",
              "quantity": 5,
              "price": 14.95
            }
        ]
    });
    let query: Query = r#"products(name !~ "Product \\d{1,2}")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "Product ",
            "quantity": 8,
            "price": 9.95
        },
    ]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn repetition_star() {
    let value = json!({
        "products": [
            {
                "name": "Product ",
                "quantity": 8,
                "price": 9.95
            },
            {
              "name": "Product 1",
              "quantity": 8,
              "price": 9.95
            },
            {
              "name": "Product 20",
              "quantity": 5,
              "price": 14.95
            }
        ]
    });
    let query: Query = r#"products(name !~ "Product \\d*")"#.parse().unwrap();
    let expected = json!([]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn repetition_plus() {
    let value = json!({
        "products": [
            {
                "name": "Product ",
                "quantity": 8,
                "price": 9.95
            },
            {
              "name": "Product 1",
              "quantity": 8,
              "price": 9.95
            },
            {
              "name": "Product 20",
              "quantity": 5,
              "price": 14.95
            }
        ]
    });
    let query: Query = r#"products(name !~ "Product \\d+")"#.parse().unwrap();
    let expected = json!([
        {
            "name": "Product ",
            "quantity": 8,
            "price": 9.95
        }
    ]);

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

// TODO: assert that a warning is logged with the proper message
#[rstest]
fn incompatible_operation_error(programming_languages: Value) {
    let query: Query = r#"languages(year !~ "year")"#.parse().unwrap();
    let expected = json!([]);
    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn array_field_value_includes_argument_value(ai_models: Value) {
    let query: Query = r#"models(tags !~ "^Open")"#.parse().unwrap();
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

#[rstest]
fn multiple_arguments(products: Value) {
    let query: Query = r#"products(name !~ "1$", name !~ "3$")"#.parse().unwrap();
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
