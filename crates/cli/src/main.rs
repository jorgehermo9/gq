use std::fs;
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let query_file = "example.gq";
    let json_file = "example.json";
    let query = fs::read_to_string(query_file)?;
    let json = fs::read_to_string(json_file)?;
    let result = gq_core::entrypoint(&query, &json);

    match result {
        Ok(query) => println!("{}", query),
        Err(err) => {
            use ariadne::{ColorGenerator, Label, Report, ReportKind, Source};

            let mut colors = ColorGenerator::new();

            let a = colors.next();
            // let span = err.span().clone();
            let span = 0..0;
            Report::build(ReportKind::Error, &query_file, span.start)
                .with_message("Invalid GQ".to_string())
                .with_label(
                    Label::new((&query_file, span))
                        .with_message(err.to_string())
                        .with_color(a),
                )
                .finish()
                .eprint((&query_file, Source::from(query)))
                .unwrap();
        }
    };
    Ok(())
}
