use crate::fixtures::{ai_models, programming_languages};
use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};
// TODO: add tests to assert warns and errors are logged
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

#[rstest]
fn multiple_properties_different_order(programming_languages: Value) {
    let query: Query = "{
        category
        languages {
            year
            name
        }
    }"
    .parse()
    .unwrap();
    let expected = json!({
      "category": "Programming Languages",
      "languages": [
        {
          "year": 1995,
          "name": "JavaScript"
        },
        {
          "year": 1995,
          "name": "Java"
        },
        {
          "year": 2010,
          "name": "Rust"
        }
      ]
    });

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

#[test]
fn very_nested_single_access() {
    let value = json!({
        "a": {
            "b": {
                "c": {
                    "d": {
                        "e": {
                            "f": {
                                "g": 42
                            }
                        }
                    }
                }
            }
        }
    });
    let query: Query = "a.b.c.d.e.f.g".parse().unwrap();

    let result = query.apply(value).unwrap();

    assert_eq!(result, 42);
}

#[test]
fn very_nested_multiple_access() {
    let value = json!({
        "a": {
            "b": {
                "c": {
                    "d": {
                        "e": {
                            "f": {
                                "g": 42
                            }
                        }
                    }
                }
            }
        }
    });
    let query: Query = "{
        a {
            b {
                c {
                    d {
                        e {
                            f {
                                g
                            }
                        }
                    }
                }
            }
        }
    }"
    .parse()
    .unwrap();

    let expected = value.clone();

    let result = query.apply(value).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn null_values_are_not_filtered_out(ai_models: Value) {
    let query: Query = "models.score".parse().unwrap();
    let expected = json!([71.49, Value::Null, 88.7]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

// TODO: is this good behaviour?
#[rstest]
fn empty_objects_are_filtered_out_inside_arrays(ai_models: Value) {
    let query: Query = "models.tags".parse().unwrap();
    let expected = json!([["NLP", "Text Generation"]]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn missing_fields_are_ommited_inside_arrays(ai_models: Value) {
    let query: Query = "{
        models {
            name
            tags
        }
    }"
    .parse()
    .unwrap();
    let expected = json!({
        "models": [
            {
                "name": "GPT-4O",
                "tags": ["NLP", "Text Generation"]
            },
            {
                "name": "Claude",
            },
            {
                "name": "LLAMA"
            }
        ]
    });

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

// TODO: is this good behaviour? Maybe we should not filter out empty arrays and objects
// in apply.rs
#[test]
fn empty_array_inside_arrays_are_filtered_out() {
    let empty_array = json!({
        "objects": [
            {
                "array": []
            },
            {
                "array": [1, 2, 3]
            }
        ]
    });
    let query: Query = "objects.array".parse().unwrap();
    let expected = json!([[1, 2, 3]]);

    let result = query.apply(empty_array).unwrap();

    assert_eq!(result, expected);
}
