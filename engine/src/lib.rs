mod utils;

use uiua::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn test(code: String) -> Result<Vec<f64>, JsError> {
    let mut uiua = Uiua::with_safe_sys();

    uiua.run_str(&code)?;

    let image = uiua.pop("image")?;
    let pixels = image
        .as_num_array()
        .ok_or_else(|| JsError::new("Expected a numeric image on the stack"))?;

    Ok(pixels.data().to_vec())
}

#[wasm_bindgen]
pub fn init() {
    utils::set_panic_hook();
}
