mod utils;

use std::cell::{OnceCell, RefCell};

use uiua::*;
use wasm_bindgen::prelude::*;
use web_sys::js_sys;

thread_local! {
    static CODE: OnceCell<RefCell<Assembly>> = const { OnceCell::new() };
    static BLOCK_STATE: OnceCell<RefCell<Vec<f64>>> = const { OnceCell::new() };

    static X: OnceCell<RefCell<usize>> = const { OnceCell::new() };
    static Y: OnceCell<RefCell<usize>> = const { OnceCell::new() };
    static Z: OnceCell<RefCell<usize>> = const { OnceCell::new() };
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

        compiler
            .create_bind_function("GetBlocks", (0, 1), |uiua| {
                BLOCK_STATE.with(|cell| {
                    let state = cell.get().unwrap();
                    uiua.push(uiua::Value::Num(
                        state.borrow().clone().into_iter().collect::<Array<f64>>(),
                    ));
                });
                Ok(())
            })
            .unwrap();
        compiler
            .create_bind_function("GetX", (0, 1), |uiua| {
                X.with(|cell| {
                    let x = cell.get().unwrap();
                    uiua.push(*x.borrow());
                });
                Ok(())
            })
            .unwrap();

        compiler
            .create_bind_function("GetY", (0, 1), |uiua| {
                Y.with(|cell| {
                    let y = cell.get().unwrap();
                    uiua.push(*y.borrow());
                });
                Ok(())
            })
            .unwrap();

        compiler
            .create_bind_function("GetZ", (0, 1), |uiua| {
                Z.with(|cell| {
                    let z = cell.get().unwrap();
                    uiua.push(*z.borrow());
                });
                Ok(())
            })
            .unwrap();

        let assembly = compiler.load_str(&code).unwrap().finish();
        cell.get_or_init(|| RefCell::new(assembly));
    });
}

#[wasm_bindgen]
pub fn render() -> Result<ImageData, JsError> {
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

    BLOCK_STATE.with(|cell| {
        let initial_state = vec![0f64; 10 * 10 * 10 * 4];
        cell.get_or_init(|| RefCell::new(initial_state));
    });
    set_active_block(1, 1, 1);
}

#[wasm_bindgen]
pub fn set_active_block(x: usize, y: usize, z: usize) {
    X.with(|cell| {
        let x_cell = cell.get_or_init(|| RefCell::new(0));
        *x_cell.borrow_mut() = x;
    });
    Y.with(|cell| {
        let y_cell = cell.get_or_init(|| RefCell::new(0));
        *y_cell.borrow_mut() = y;
    });
    Z.with(|cell| {
        let z_cell = cell.get_or_init(|| RefCell::new(0));
        *z_cell.borrow_mut() = z;
    });
}

#[wasm_bindgen]
pub fn set_block_state(x: usize, y: usize, z: usize, r: f64, g: f64, b: f64, a: f64) {
    BLOCK_STATE.with(|cell| {
        let state = cell.get().unwrap();
        let mut state = state.borrow_mut();
        let index = (x * 10 * 10 + y * 10 + z) * 4;
        state[index] = r;
        state[index + 1] = g;
        state[index + 2] = b;
        state[index + 3] = a;
    });
}
