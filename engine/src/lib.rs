mod utils;

use uiua::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn test(code: String) -> Result<isize, JsError> {
    let mut uiua = Uiua::with_safe_sys();

    uiua.run_str(&code)?;

    Ok(uiua.pop_int()?)
}

#[wasm_bindgen]
pub fn init() {
    utils::set_panic_hook();
}
