use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

use crate::fixtures::{ai_models, products};

// TODO: add advanced usage complicated test

#[rstest]
fn filtering_accessing_and_aliasing(products: Value) {
    let query: Query = r#"{
        products(price < 15.00).name: cheap
        products(price >= 15.00).name: expensive
    }"#
    .parse()
    .unwrap();
    let expected = json!({
        "cheap": ["Product 1", "Product 2"],
        "expensive": ["Product 3"]
    });

    let result = query.apply(products).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn indexing_and_accessing(ai_models: Value) {
    let query: Query = "models[0].tags[0]".parse().unwrap();
    let expected = json!("NLP");

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn indexing_accessing_and_aliasing_object(ai_models: Value) {
    let query: Query = "models[0] { tags[0]: myTags} ".parse().unwrap();
    let expected = json!( {
        "myTags": "NLP"
    });

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}
