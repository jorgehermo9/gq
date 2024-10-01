use gq_core::query::Query;
use rstest::rstest;
use serde_json::{json, Value};

use crate::fixtures::{ai_models, products, programming_languages};

#[rstest]
fn string_argument_value(programming_languages: Value) {
    let query: Query = r#"languages(name != "JavaScript")"#.parse().unwrap();
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
fn integer_argument_value(programming_languages: Value) {
    let query: Query = r#"languages(year != 1995)"#.parse().unwrap();
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
fn float_argument_value(products: Value) {
    let query: Query = r#"products(price != 14.95)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "Product 1",
          "quantity": 8,
          "price": 9.95,
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
fn boolean_argument_value(programming_languages: Value) {
    let query: Query = r#"languages(popular != true)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "Java",
          "popular": false,
          "year": 1995
        },
    ]);

    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn null_argument_value(ai_models: Value) {
    let query: Query = r#"models(score != null)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "GPT-4O",
          "openSource": false,
          "score": 71.49,
          "tags": ["NLP", "Text Generation"]
        },
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
fn float_argument_value_with_null_field_value(ai_models: Value) {
    let query: Query = r#"models(score != 88.7)"#.parse().unwrap();
    let expected = json!([
        {
          "name": "GPT-4O",
          "openSource": false,
          "score": 71.49,
          "tags": ["NLP", "Text Generation"]
        },
        {
          "name": "Claude",
          "openSource": false,
          "score": null
        },
    ]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

// TODO: in this test, the null tags (Claude example) is returned due to the behaviopur of `DEFAULT_INSPECTED_VALUE`
// defaulting to null. Maybe we shouldn't use null as default value if missing, and just return false?
// TODO: ALso, maybe GTP-4O should be returned as well. The behaviour here should be
// "at least one of the values in the array is not equal to the argument value",
// but right now it's "all values in the array are not equal to the argument value"
// because of the negation of the equality check. This is the same problem as in less_equal and
// greater_equal tests.
#[rstest]
fn array_field_value_not_includes_argument_value(ai_models: Value) {
    let query: Query = r#"models(tags != "NLP")"#.parse().unwrap();
    let expected = json!([
        {
          "name": "Claude",
          "openSource": false,
          "score": null
        },
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

// TODO: in this test, the null tags is returned due to the behaviopur of `DEFAULT_INSPECTED_VALUE`
// defaulting to null. Maybe we shouldn't use null as default value if missing, and just return false?
#[rstest]
fn array_field_value_not_includes_multiple_argument_value(ai_models: Value) {
    let query: Query = r#"models(tags != "NLP", tags != "Open Source")"#.parse().unwrap();
    let expected = json!([
        {
          "name": "Claude",
          "openSource": false,
          "score": null
        },
    ]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

// TODO: Revisit the behaviopur of `DEFAULT_INSPECTED_VALUE` and decide if this test is valid,
// Currently, we have to exclude the null values manually if they are missing in the value.
#[rstest]
fn array_field_value_not_includes_multiple_argument_value_nor_null(ai_models: Value) {
    let query: Query = r#"models(tags != "NLP", tags != "Text Generation", tags != null)"#
        .parse()
        .unwrap();
    let expected = json!([]);

    let result = query.apply(ai_models).unwrap();

    assert_eq!(result, expected);
}

#[rstest]
fn multiple_arguments(programming_languages: Value) {
    let query: Query = r#"languages(popular != true, year != 2010)"#.parse().unwrap();
    let expected = json!([
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
fn value_not_found(programming_languages: Value) {
    let query: Query = r#"languages(name != "value_not_found")"#.parse().unwrap();
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

// TODO: Assert that a warning is logged
// TODO: This test is broken. We can't implement the not_equal as a equal negation, since
// a missing field at equal would evaluate to false, and then it would be true at not_equal.
// Maybe we should return an error if the field is missing? Or implement differently the negation?
// I think the same applies for greater and less-equal. If we just apply the negation, these cases
// would be weird
#[rstest]
// fn missing_field(programming_languages: Value) {
//     let query: Query = r#"languages(missing_field != 5)"#.parse().unwrap();
//     let expected = json!([]);

//     let result = query.apply(programming_languages).unwrap();

//     assert_eq!(result, expected);
// }

// TODO: assert that a warning is logged about the incompatible type
// TODO: This works because the incompatible type case is an error. Maybe we should
// do the same with the missing field case.
#[rstest]
fn incomparable_types_error(programming_languages: Value) {
    let query: Query = r#"languages(name != 1995)"#.parse().unwrap();
    let expected = json!([]);
    let result = query.apply(programming_languages).unwrap();

    assert_eq!(result, expected);
}
