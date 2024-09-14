use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

use crate::fixtures::ai_models;

#[rstest]
fn simple(ai_models: Value) {
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
fn nested_property(ai_models: Value) {
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

#[rstest]
fn multiple_properties(ai_models: Value) {
    let query: Query = r#"{
        id: identifier
        models.name: modelNames
    }"#
    .parse()
    .unwrap();
    let expected = json!({
        "identifier": "AI-Models",
        "modelNames": [
            "GPT-4O",
            "Claude",
            "LLAMA"
        ]
    });

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn outer(ai_models: Value) {
    let query: Query = r#"{
        models: MyAiModels {
            name
            openSource
            score
        }
    }"#
    .parse()
    .unwrap();
    let expected = json!({
        "MyAiModels": [
            {
                "name": "GPT-4O",
                "openSource": false,
                "score": 71.49
            },
            {
                "name": "Claude",
                "openSource": false,
                "score": null
            },
            {
                "name": "LLAMA",
                "openSource": true,
                "score": 88.7
            }
        ]
    });

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn inner(ai_models: Value) {
    let query: Query = r#"{
        models {
            name: modelName
            openSource: isOSS
            score: modelScore
        }
    }"#
    .parse()
    .unwrap();
    let expected = json!({
        "models": [
            {
                "modelName": "GPT-4O",
                "isOSS": false,
                "modelScore": 71.49
            },
            {
                "modelName": "Claude",
                "isOSS": false,
                "modelScore": null
            },
            {
                "modelName": "LLAMA",
                "isOSS": true,
                "modelScore": 88.7
            }
        ]
    });

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn outer_and_inner(ai_models: Value) {
    let query: Query = r#"{
        models: MyAiModels {
            name: modelName
            openSource: isOSS
            score: modelScore
        }
    }"#
    .parse()
    .unwrap();
    let expected = json!({
        "MyAiModels": [
            {
                "modelName": "GPT-4O",
                "isOSS": false,
                "modelScore": 71.49
            },
            {
                "modelName": "Claude",
                "isOSS": false,
                "modelScore": null
            },
            {
                "modelName": "LLAMA",
                "isOSS": true,
                "modelScore": 88.7
            }
        ]
    });

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}
