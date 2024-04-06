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
    // TODO: allow for more chars
    #[regex(r"[a-zA-Z_]\w*")]
    Key(&'src str),
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
    Key(String),
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
            OwnedToken::Key(key) => write!(f, "{key}"),
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
            Token::Key(key) => OwnedToken::Key(key.to_string()),
            Token::EOF => OwnedToken::EOF,
        }
    }
}
