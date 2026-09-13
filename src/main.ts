import { init, test } from 'engine';

const canvas = document.getElementById('game') as HTMLCanvasElement;

init();

function render() {
  const pixelArray = test(
    `U ← /=⊞<⚂_⚂ /+×⟜ⁿ1_2
I ← <⊙(⌵/ℂ) # Circle
u ← +0.1⧋↧ ⊃(I0.95|⊂⊙0.5⇌˙×)
A ← ×⊃U(I1) # Alpha
⧋(⊂⊃u A) ˙⊞⊟-⊸¬÷⟜⇡⌈×⚂ 200`,
  );

  const dimensions = Math.sqrt(pixelArray.length / 4);

  const imageData = new ImageData(new Uint8ClampedArray(pixelArray.map((v) => v * 255)), dimensions, dimensions);

  canvas.width = dimensions;
  canvas.height = dimensions;
  canvas.getContext('2d')?.putImageData(imageData, 0, 0);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
