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
pub enum Token<'src> {
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
    // TODO: allow for more chars
    #[regex(r"[a-zA-Z_]\w*")]
    Key(&'src str),
    // Values
    #[token("false", |_| false)]
    #[token("true", |_| true)]
    Bool(bool),
    // Got from https://logos.maciej.codes/examples/json.html, didn't even mind to understand it
    // TODO: the unwrap is ok here? the regex should be valid for the f64 parsing
    #[regex(r"-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?", |lex| lex.slice().parse::<f64>().unwrap())]
    Number(f64),
    #[regex(r#""([^"\\]|\\["\\bnfrt]|u[a-fA-F0-9]{4})*""#, |lex| &lex.slice()[1..lex.slice().len() - 1])]
    String(&'src str),
    #[token("null")]
    Null,
    EOF,
}

#[derive(Clone, Debug, PartialEq)]
pub enum OwnedToken {
    LBrace,
    RBrace,
    LParen,
    RParen,
    Dot,
    Colon,
    Comma,
    Key(String),
    Bool(bool),
    Number(f64),
    String(String),
    Null,
    EOF,
}

impl Display for OwnedToken {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            OwnedToken::LBrace => write!(f, "{{"),
            OwnedToken::RBrace => write!(f, "}}"),
            OwnedToken::LParen => write!(f, "("),
            OwnedToken::RParen => write!(f, ")"),
            OwnedToken::Dot => write!(f, "."),
            OwnedToken::Colon => write!(f, ":"),
            OwnedToken::Comma => write!(f, ","),
            OwnedToken::Key(key) => key.fmt(f),
            OwnedToken::Bool(b) => b.fmt(f),
            OwnedToken::Number(n) => n.fmt(f),
            OwnedToken::String(s) => s.fmt(f),
            OwnedToken::Null => write!(f, "null"),
            OwnedToken::EOF => write!(f, "EOF"),
        }
    }
}

impl From<Token<'_>> for OwnedToken {
    fn from(token: Token) -> Self {
        match token {
            Token::LBrace => OwnedToken::LBrace,
            Token::RBrace => OwnedToken::RBrace,
            Token::LParen => OwnedToken::LParen,
            Token::RParen => OwnedToken::RParen,
            Token::Dot => OwnedToken::Dot,
            Token::Colon => OwnedToken::Colon,
            Token::Comma => OwnedToken::Comma,
            Token::Key(key) => OwnedToken::Key(key.to_string()),
            Token::Bool(b) => OwnedToken::Bool(b),
            Token::Number(n) => OwnedToken::Number(n),
            Token::String(s) => OwnedToken::String(s.to_string()),
            Token::Null => OwnedToken::Null,
            Token::EOF => OwnedToken::EOF,
        }
    }
}
