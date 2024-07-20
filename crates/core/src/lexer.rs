use core::fmt;
use std::fmt::{Display, Formatter};

use logos::Logos;
use thiserror::Error;

#[derive(Error, Clone, Default, Debug, PartialEq)]
pub enum Error {
    #[default]
    #[error("Unknown character")]
    UnknownCharacter,
}

#[derive(Clone, Debug, Logos, PartialEq)]
#[logos(skip r"[ \t\r\n\f]+")]
#[logos(error = Error)]

pub enum Token {
    #[token("{")]
    LBrace,
    #[token("}")]
    RBrace,
    #[token("(")]
    LParen,
    #[token(")")]
    RParen,
    #[token("[")]
    LBracket,
    #[token("]")]
    RBracket,
    #[token(".")]
    Dot,
    #[token(":")]
    Colon,
    #[token(",")]
    Comma,
    #[token("=")]
    Equal,
    #[token("!=")]
    NotEqual,
    #[token(">")]
    Greater,
    #[token(">=")]
    GreaterEqual,
    #[token("<")]
    Less,
    #[token("<=")]
    LessEqual,
    #[token("~")]
    Tilde,
    #[token("!~")]
    NotTilde,
    // This regex does not support keys starting with '-' or numbers
    #[regex(r"[a-zA-Z_][\w-]*", |lex| lex.slice().to_string())]
    Identifier(String),
    // Values
    #[token("false", |_| false)]
    #[token("true", |_| true)]
    Bool(bool),
    // TODO: conflate those 3 types into a single Number enum?
    // Got from https://logos.maciej.codes/examples/json.html, didn't even mind to understand it
    // TODO: the unwrap is ok here? the regex should be valid for the f64 parsing
    #[regex(r"-?(?:0|[1-9]\d*)\.\d+(?:[eE][+-]?\d+)?", |lex| lex.slice().parse::<f64>().unwrap())]
    Float(f64),
    // TODO: handle error
    #[regex(r"0|[1-9]\d*", |lex| lex.slice().parse::<u64>().unwrap())]
    PosInteger(u64),
    // TODO: handle error
    #[regex(r"-(?:0|[1-9]\d*)", |lex| lex.slice().parse::<i64>().unwrap())]
    NegInteger(i64),
    // This string follows [RFC 8259](https://datatracker.ietf.org/doc/html/rfc8259)
    // Single quoted strings are not allowed
    #[regex(r#""(?:[^"]|\\")*""#, |lex| {
        // TODO: handle the unquote error with custom lexer errors
        // TODO: improve slicing?
        let target_slice = &lex.slice()[1..lex.slice().len() - 1];
        escape8259::unescape(target_slice).expect("Error while unquoting")
    }
    )]
    String(String),
    #[token("null")]
    Null,
    EOF,
}

impl Display for Token {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Token::LBrace => '{'.fmt(f),
            Token::RBrace => '}'.fmt(f),
            Token::LParen => '('.fmt(f),
            Token::RParen => ')'.fmt(f),
            Token::LBracket => '['.fmt(f),
            Token::RBracket => ']'.fmt(f),
            Token::Dot => '.'.fmt(f),
            Token::Colon => ':'.fmt(f),
            Token::Comma => ','.fmt(f),
            Token::Equal => '='.fmt(f),
            Token::NotEqual => "!=".fmt(f),
            Token::Greater => '>'.fmt(f),
            Token::GreaterEqual => ">=".fmt(f),
            Token::Less => '<'.fmt(f),
            Token::LessEqual => "<=".fmt(f),
            Token::Tilde => '~'.fmt(f),
            Token::NotTilde => "!~".fmt(f),
            Token::Identifier(key) => key.fmt(f),
            Token::Bool(b) => b.fmt(f),
            Token::PosInteger(n) => n.fmt(f),
            Token::NegInteger(n) => n.fmt(f),
            Token::Float(n) => n.fmt(f),
            Token::String(s) => s.fmt(f),
            Token::Null => "null".fmt(f),
            Token::EOF => "EOF".fmt(f),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rstest::rstest;

    /// Gets the next token and asserts that there are no more tokens left
    fn get_next_token(input: &str) -> Token {
        let mut lexer = Token::lexer(input);
        let token = lexer
            .next()
            .expect("There should be at least one token")
            .expect("Error parsing token");
        assert_eq!(lexer.next(), None);

        token
    }

    #[rstest]
    #[case::l_brace("{", Token::LBrace)]
    #[case::r_brace("}", Token::RBrace)]
    #[case::l_paren("(", Token::LParen)]
    #[case::r_paren(")", Token::RParen)]
    #[case::l_bracket("[", Token::LBracket)]
    #[case::r_bracket("]", Token::RBracket)]
    #[case::dot(".", Token::Dot)]
    #[case::colon(":", Token::Colon)]
    #[case::comma(",", Token::Comma)]
    #[case::equal("=", Token::Equal)]
    #[case::not_equal("!=", Token::NotEqual)]
    #[case::greater(">", Token::Greater)]
    #[case::greater_equal(">=", Token::GreaterEqual)]
    #[case::less("<", Token::Less)]
    #[case::less_equal("<=", Token::LessEqual)]
    #[case::tilde("~", Token::Tilde)]
    #[case::not_tilde("!~", Token::NotTilde)]
    #[case::true_token("true", Token::Bool(true))]
    #[case::false_token("false", Token::Bool(false))]
    #[case::null("null", Token::Null)]
    fn simple_token_parses(#[case] input: &str, #[case] expected: Token) {
        let token = get_next_token(input);
        assert_eq!(token, expected);
    }

    #[rstest]
    #[case::positive("5", 5.0)]
    #[case::negative("-5", -5.0)]
    #[case::float("5.5", 5.5)]
    #[case::negative_float("-5.5", -5.5)]
    #[case::float_with_exponent("5.5e5", 5.5e5)]
    #[case::float_with_negative_exponent("5.5e-5", 5.5e-5)]
    #[case::float_with_positive_exponent("5.5e+5", 5.5e5)]
    #[case::float_with_uppercase_exponent("5.5E5", 5.5e5)]
    #[case::float_with_uppercase_positive_exponent("5.5E+5", 5.5e5)]
    #[case::float_with_uppercase_negative_exponent("5.5E-5", 5.5e-5)]
    fn number_token_parses(#[case] input: &str, #[case] expected: f64) {
        let token = get_next_token(input);
        let expected = Token::Float(expected);
        assert_eq!(token, expected);
    }

    #[test]
    #[should_panic]
    fn number_token_parse_fails_when_wrong_decimal_separator() {
        let input = "5,5";
        // This fails due to the fact that this input is three tokens length
        // and the get_next_token asserts that there are no tokens left
        get_next_token(input);
    }

    #[rstest]
    #[case::simple("key")]
    #[case::with_underscore("key_with_underscore")]
    #[case::with_numbers("key_with_123_numbers")]
    #[case::with_dash("key-with-dash")]
    #[case::with_dash_and_underscore("key-with-dash_and_underscore")]
    #[case::with_caps("KeyWithCaps")]
    #[case::starting_with_underscore("_key")]
    fn identifier_token_parses(#[case] input: &str) {
        let expected = Token::Identifier(input.to_string());
        let token = get_next_token(input);
        assert_eq!(token, expected);
    }

    #[rstest]
    #[case::simple(r#""JavaScript""#, "JavaScript")]
    #[case::with_space(r#""Java Script""#, "Java Script")]
    #[case::with_double_commas(r#""Java\"Script""#, "Java\"Script")]
    #[case::with_single_commas(r#""Java'Script""#, "Java'Script")]
    #[case::double_quoted_with_single_commas(r#""Java'Script""#, "Java'Script")]
    #[case::newline(r#""Java\nScript""#, "Java\nScript")]
    #[case::tab(r#""Java\tScript""#, "Java\tScript")]
    #[case::backslash(r#""Java\\Script""#, "Java\\Script")]
    #[case::backslash_and_quote(r#""Java\\\"Script""#, "Java\\\"Script")]
    #[case::mixed(r#""/Jav\r\n\ta\\\"Scri\"pt\n""#, "/Jav\r\n\ta\\\"Scri\"pt\n")]
    fn string_token_parses(#[case] input: &str, #[case] expected: &str) {
        let expected = Token::String(expected.to_string());
        let token = get_next_token(input);
        assert_eq!(token, expected);
    }

    // TODO: change the lexer so an `Err` variant is returned instead of panicking
    #[test]
    #[should_panic]
    fn string_token_parse_unescape_fails_when_malformed_escaped_input() {
        let input = r#""Java\\"Script""#;
        get_next_token(input);
    }

    // Single quoted strings are not allowed
    #[test]
    #[should_panic]
    fn string_token_parse_fails_when_single_quoted() {
        let input = r#"'Java Script'"#;
        get_next_token(input);
    }
}
