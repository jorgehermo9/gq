use super::fixtures::programming_languages;
use gq_core::query::Query;
use rstest::*;
use serde_json::{json, Value};

#[rstest]
fn primitive_property(programming_languages: Value) {
    let query: Query = "category".parse().unwrap();

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, "Programming Languages");
}

#[rstest]
fn property_inside_array(programming_languages: Value) {
    let query: Query = "languages.name".parse().unwrap();
    let expected = json!(["JavaScript", "Java", "Rust"]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn multiple_properties(programming_languages: Value) {
    let query: Query = "{
        category
        languages {
            name
            year
        }
    }"
    .parse()
    .unwrap();
    let expected = json!({
      "category": "Programming Languages",
      "languages": [
        {
          "name": "JavaScript",
          "year": 1995
        },
        {
          "name": "Java",
          "year": 1995
        },
        {
          "name": "Rust",
          "year": 2010
        }
      ]
    });

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}
