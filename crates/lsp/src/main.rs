// TODO: remove this file

fn main() {
    let query = "query{que pasa key{hola.} hermano god{deivid}}";
    let trigger_char = '.';
    let position = query.find(trigger_char).unwrap() + 1;
    // aplanar el arbol de query en un sola query key (como si fuese la root)
    // hasta que contenga el patch identifier. Hacer una funcion que me devuelva
    // un Option<QueryKey>, si el hijo no contiene el patch identifier, entonces
    // devolver None, si contiene el patch identifier, entonces devolver el QueryKey
    // y se hace un merge del query key con el padre, para seguir devolvindo
    dbg!(gq_lsp::completions(query, position, trigger_char));
}
