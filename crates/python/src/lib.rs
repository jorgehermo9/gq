use gq_core::data::DataType;
use gq_core::query::Query;
use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;

/// Formats the sum of two numbers as string.
#[pyfunction]
fn gq(query: &str, data: &str) -> PyResult<String> {
    let query = query
        .parse::<Query>()
        .map_err(|e| PyErr::new::<PyValueError, _>(format!("Parser error: {e}")))?;

    // TODO: json hardcoded
    let core_data = DataType::Json
        .value_from_str(data)
        .map_err(|e| PyErr::new::<PyValueError, _>(format!("Data parsing error: {e}")))?;

    let result = query
        .apply(core_data)
        .map_err(|e| PyErr::new::<PyValueError, _>(format!("Query error: {e}")))?;

    Ok(serde_json::to_string(&result).unwrap())
}

/// A Python module implemented in Rust.
#[pymodule]
fn gqlang(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(gq, m)?)?;
    Ok(())
}
