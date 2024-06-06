// TODO: remove this file

use gq_core::data::Data;

fn main() {
    let query = std::fs::read_to_string("example.gq").unwrap();
    let trigger_char = '.';
    let position = query.find(trigger_char).unwrap() + 1;
    let value = std::fs::read_to_string("example.json").unwrap();

    let data = Data::json(value.into());
    // aplanar el arbol de query en un sola query key (como si fuese la root)
    // hasta que contenga el patch identifier. Hacer una funcion que me devuelva
    // un Option<QueryKey>, si el hijo no contiene el patch identifier, entonces
    // devolver None, si contiene el patch identifier, entonces devolver el QueryKey
    // y se hace un merge del query key con el padre, para seguir devolvindo
    dbg!(gq_lsp::get_completions(
        &query,
        position,
        trigger_char,
        &data
    ));
}
