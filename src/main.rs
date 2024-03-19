use std::fs;

use gq::lexer::Token;
use gq::parser::Parser;
use logos::Logos;
fn main() {
    let file = "example.gq";
    let source = fs::read_to_string(file).unwrap();
    let lexer = Token::lexer(&source);

    for token in lexer {
        println!("{:?}", token);
    }

    match Parser::new(&source).parse() {
        Ok(query) => println!("{:#?}", query),
        Err((msg, span)) => {
            use ariadne::{ColorGenerator, Label, Report, ReportKind, Source};

            let mut colors = ColorGenerator::new();

            let a = colors.next();

            Report::build(ReportKind::Error, &file, span.start)
                .with_message("Invalid GQ".to_string())
                .with_label(Label::new((&file, span)).with_message(msg).with_color(a))
                .finish()
                .eprint((&file, Source::from(source)))
                .unwrap();
        }
    }
}
