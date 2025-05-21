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

const toolSel = document.getElementById('toolSelector');

// simple 4-dir flood fill
function floodFill(idx) {
  const size  = +sizeSlider.value;
  const cells = Array.from(grid.children);
  const target = cells[idx].style.backgroundColor || '#fff';
  const fill   = colorPicker.value;
  if (target === fill) return;

  const stack = [idx], visited = new Set();
  while (stack.length) {
    const i = stack.pop();
    if (visited.has(i)) continue;
    visited.add(i);

    if ((cells[i].style.backgroundColor || '#fff') === target) {
      cells[i].style.backgroundColor = fill;
      const x = i % size, y = Math.floor(i / size);
      [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]
        .forEach(([nx,ny]) => {
          if (nx>=0&&nx<size&&ny>=0&&ny<size)
            stack.push(ny*size + nx);
        });
    }
  }
}

// integrate into painting handler
grid.addEventListener('mousedown', e => {
  if (!e.target.classList.contains('cell')) return;
  const idx = Array.from(grid.children).indexOf(e.target);
  if (toolSel.value === 'bucket') floodFill(idx);
  else paint(e.target);
});