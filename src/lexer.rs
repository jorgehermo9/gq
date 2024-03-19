use logos::Logos;

#[derive(Debug, Logos)]
#[logos(skip r"[ \t\r\n\f]+")]
pub enum Token<'source> {
    #[token("{")]
    BraceOpen,

    #[token("}")]
    BraceClose,

    #[token(",")]
    Comma,

    // TODO: allow for more chars
    #[regex(r"[a-zA-Z_]\w*")]
    Key(&'source str),
}
