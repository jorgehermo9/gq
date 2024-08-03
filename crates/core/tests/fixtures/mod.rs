use rstest::fixture;
use serde_json::Value;

#[fixture]
pub fn programming_languages() -> Value {
    serde_json::json!({
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
