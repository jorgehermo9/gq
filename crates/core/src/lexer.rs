use core::fmt;
use std::fmt::{Display, Formatter};

use logos::Logos;
use thiserror::Error;

#[derive(Error, Clone, Default, Debug, PartialEq)]
pub enum LexerError {
    #[default]
    #[error("Unknown character")]
    UnknownCharacter,
}

#[derive(Clone, Debug, Logos, PartialEq)]
#[logos(skip r"[ \t\r\n\f]+")]
#[logos(error = LexerError)]
pub enum Token<'src> {
    // TODO: rename this to LBrace and RBrace?
    #[token("{")]
    BraceOpen,

    #[token("}")]
    BraceClose,

    // TODO: rename this to LParen and RParen?
    #[token("(")]
    ParenOpen,

    #[token(")")]
    ParenClose,

    // TODO: allow for more chars
    #[regex(r"[a-zA-Z_]\w*")]
    Key(&'src str),

    EOF,
}

#[derive(Clone, Debug, PartialEq)]
pub enum OwnedToken {
    BraceOpen,
    BraceClose,
    ParenOpen,
    ParenClose,
    Key(String),
    EOF,
}

impl Display for OwnedToken {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            OwnedToken::BraceOpen => write!(f, "{{"),
            OwnedToken::BraceClose => write!(f, "}}"),
            OwnedToken::ParenOpen => write!(f, "("),
            OwnedToken::ParenClose => write!(f, ")"),
            OwnedToken::Key(key) => write!(f, "{}", key),
            OwnedToken::EOF => write!(f, "EOF"),
        }
    }
}

impl From<Token<'_>> for OwnedToken {
    fn from(token: Token) -> Self {
        match token {
            Token::BraceOpen => OwnedToken::BraceOpen,
            Token::BraceClose => OwnedToken::BraceClose,
            Token::ParenOpen => OwnedToken::ParenOpen,
            Token::ParenClose => OwnedToken::ParenClose,
            Token::Key(key) => OwnedToken::Key(key.to_string()),
            Token::EOF => OwnedToken::EOF,
        }
    }
}
