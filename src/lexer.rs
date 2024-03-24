use logos::Logos;
use thiserror::Error;

#[derive(Error, Clone, Default, Debug, PartialEq)]
pub enum LexerError {
    #[default]
    #[error("Unknown character")]
    UnknownCharacter,
}

#[derive(Debug, Logos)]
#[logos(skip r"[ \t\r\n\f]+")]
#[logos(error = LexerError)]
pub enum Token<'source> {
    #[token("{")]
    BraceOpen,

    #[token("}")]
    BraceClose,

    // TODO: allow for more chars
    #[regex(r"[a-zA-Z_]\w*")]
    Key(&'source str),

    EOF,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_lexer() {
        let input = "";
        let mut lexer = Token::lexer(input);
        dbg!(lexer.next());
    }
}
