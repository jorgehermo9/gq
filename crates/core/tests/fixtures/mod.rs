use rstest::fixture;
use serde_json::{json, Value};

#[fixture]
pub fn programming_languages() -> Value {
    json!({
          "category": "Programming Languages",
          "users": 42230,
          "languages": [
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
          ]
    })
}

#[fixture]
pub fn products() -> Value {
    json!({
          "id": "Test",
          "totalPrice": 1000,
          "products": [
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
            {
              "name": "Product 3",
              "quantity": 4,
              "price": 24.95
            }
          ]
    })
}

#[fixture]
pub fn ai_models() -> Value {
    json!(
        {
          "id": "AI-Models",
          "models": [
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
            {
              "name": "LLAMA",
              "openSource": true,
              "score": 88.7
            }
          ]
        }
    )
}
