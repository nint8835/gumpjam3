mod utils;

use std::cell::{OnceCell, RefCell};

use uiua::*;
use wasm_bindgen::prelude::*;
use web_sys::js_sys;

thread_local! {
    static CODE: OnceCell<RefCell<Assembly>> = const { OnceCell::new() };
}

#[wasm_bindgen]
pub struct ImageData {
    pixels: Vec<u8>,
    shape: Vec<usize>,
}

#[wasm_bindgen]
impl ImageData {
    pub fn pixels_ptr(&self) -> *const u8 {
        self.pixels.as_ptr()
    }

    pub fn pixels_len(&self) -> usize {
        self.pixels.len()
    }

    pub fn shape_ptr(&self) -> *const usize {
        self.shape.as_ptr()
    }

    pub fn shape_len(&self) -> usize {
        self.shape.len()
    }
}

#[wasm_bindgen]
pub fn set_code(code: String) {
    CODE.with(|cell| {
        let mut compiler = Compiler::new();
        let assembly = compiler.load_str(&code).unwrap().finish();
        cell.get_or_init(|| RefCell::new(assembly));
    });
}

#[wasm_bindgen]
pub fn test() -> Result<ImageData, JsError> {
    let mut uiua = Uiua::with_safe_sys();

    CODE.with(|cell| {
        let assembly = cell.get().unwrap().borrow();
        uiua.run_asm(assembly.clone()).unwrap();
    });

    let image = uiua.pop("image")?;
    let shape = image.shape.to_vec();
    let pixels = image
        .as_num_array()
        .ok_or_else(|| JsError::new("Expected a numeric image on the stack"))?;

    let pixels = pixels
        .data()
        .iter()
        .map(|x| (x * 255.0) as u8)
        .collect::<Vec<u8>>();

    Ok(ImageData { pixels, shape })
}

#[wasm_bindgen]
pub fn wasm_memory() -> js_sys::WebAssembly::Memory {
    wasm_bindgen::memory().unchecked_into()
}

#[wasm_bindgen]
pub fn init() {
    utils::set_panic_hook();
}
