use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

use crate::fixtures::ai_models;

#[rstest]
fn primitive_property(ai_models: Value) {
    let query: Query = r#"{
      id: identifier
    }"#
    .parse()
    .unwrap();
    let expected = json!({
      "identifier": "AI-Models"
    });

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn complex(ai_models: Value) {
    let query: Query = r#"{
      models.name: modelNames
    }"#
    .parse()
    .unwrap();
    let expected = json!({
      "modelNames": [
        "GPT-4O",
        "Claude",
        "LLAMA"
      ]
    });

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}
