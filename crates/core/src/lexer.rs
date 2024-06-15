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
    // TODO: allow for more chars, so not so many things has to be escaped with quotes
    // This regex does not support keys starting with '-' or numbers
    #[regex(r"[a-zA-Z_][\w-]*", |lex| lex.slice().to_string())]
    Identifier(String),
    // Values
    #[token("false", |_| false)]
    #[token("true", |_| true)]
    Bool(bool),
    // Got from https://logos.maciej.codes/examples/json.html, didn't even mind to understand it
    // TODO: the unwrap is ok here? the regex should be valid for the f64 parsing
    #[regex(r"-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?", |lex| lex.slice().parse::<f64>().unwrap())]
    Number(f64),
    #[regex(r#"(?:"(?:[^"]|\\")*")|(?:'(?:[^']|\\')*')"#, |lex| {
        unescape::unescape(&lex.slice()[1..lex.slice().len() - 1]).unwrap()
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
            Token::LBrace => write!(f, "{{"),
            Token::RBrace => write!(f, "}}"),
            Token::LParen => write!(f, "("),
            Token::RParen => write!(f, ")"),
            Token::Dot => write!(f, "."),
            Token::Colon => write!(f, ":"),
            Token::Comma => write!(f, ","),
            Token::Equal => write!(f, "="),
            Token::NotEqual => write!(f, "!="),
            Token::Greater => write!(f, ">"),
            Token::GreaterEqual => write!(f, ">="),
            Token::Less => write!(f, "<"),
            Token::LessEqual => write!(f, "<="),
            Token::Tilde => write!(f, "~"),
            Token::NotTilde => write!(f, "!~"),
            Token::Identifier(key) => write!(f, "{key}"),
            Token::Bool(b) => write!(f, "{b}"),
            Token::Number(n) => write!(f, "{n}"),
            Token::String(s) => write!(f, "{s}"),
            Token::Null => write!(f, "null"),
            Token::EOF => write!(f, "EOF"),
        }
    }
}
