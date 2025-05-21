//grid generation 
function createGrid(size) {
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${size}, 20px)`;
  grid.style.gridTemplateRows    = `repeat(${size}, 20px)`;
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    grid.appendChild(cell);
  }
}

// By Default, draw a 16×16 grid
window.addEventListener('DOMContentLoaded', () => {
  const defaultSize = 16;
  createGrid(defaultSize);
});
 
// grab the new element
const colorPicker = document.getElementById('colorPicker');
let mouseDown = false;
document.body.addEventListener('mousedown', () => mouseDown = true);
document.body.addEventListener('mouseup',   () => mouseDown = false);

// paint on mousedown or drag
function paint(cell) {
  cell.style.backgroundColor = colorPicker.value;
}

// wire up events after grid creation
grid.addEventListener('mousedown', e => {
  if (e.target.classList.contains('cell')) paint(e.target);
});
grid.addEventListener('mouseover', e => {
  if (mouseDown && e.target.classList.contains('cell'))
    paint(e.target);
});
