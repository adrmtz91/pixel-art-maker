const grid        = document.getElementById('grid');
const sizeSlider  = document.getElementById('sizeSlider');
const sizeValue   = document.getElementById('sizeValue');
const sizeValue2  = document.getElementById('sizeValue2');
const colorPicker = document.getElementById('colorPicker');
const clearBtn    = document.getElementById('clearBtn');
const saveBtn     = document.getElementById('saveBtn');
const undoBtn     = document.getElementById('undoBtn');
const redoBtn     = document.getElementById('redoBtn');
const toolSel     = document.getElementById('toolSelector');

// State & history 
let history      = [];
let historyIndex = -1;
let mouseDown    = false;
let brushStartSnap = null;

// Snapshot Helpers
function getSnapshot() {
  return {
    size: +sizeSlider.value,
    colors: Array.from(grid.children)
                 .map(c => c.style.backgroundColor || '#fff')
  };
}

function applySnapshot({ size, colors }) {
  createGrid(size);
  grid.childNodes.forEach((c, i) => {
    c.style.backgroundColor = colors[i];
  });
}

function pushState() {
  const snap = getSnapshot();
  history = history.slice(0, historyIndex + 1);
  history.push(snap);
  historyIndex = history.length - 1;
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
}

function recordPair(before, after) {
  history = history.slice(0, historyIndex + 1);
  history.push(before, after);
  historyIndex = history.length - 1;
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
  localStorage.setItem('pixelArtState', JSON.stringify({ history, historyIndex }));
}

// Core Actions
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

function paint(cell) {
  cell.style.backgroundColor = colorPicker.value;
}

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
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          stack.push(ny * size + nx);
        }
      });
    }
  }
}

function clearGrid() {
  grid.childNodes.forEach(c => c.style.backgroundColor = '#fff');
}

function exportPNG() {
  const size = +sizeSlider.value;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  Array.from(grid.children).forEach((cell, i) => {
    ctx.fillStyle = cell.style.backgroundColor || '#fff';
    ctx.fillRect(i % size, Math.floor(i / size), 1, 1);
  });

  const link = document.createElement('a');
  link.download = 'pixel-art.png';
  link.href = canvas.toDataURL();
  link.click();
}

function updateHistoryButtons() {
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    applySnapshot(history[historyIndex]);
    updateHistoryButtons();
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    applySnapshot(history[historyIndex]);
    updateHistoryButtons();
  }
}

// Event Listeners
// Mouse tracking for brush
document.body.addEventListener('mousedown', () => mouseDown = true);
document.body.addEventListener('mouseup',   () => {
  mouseDown = false;
  if (brushStartSnap) {
    const after = getSnapshot();
    recordPair(brushStartSnap, after);
    brushStartSnap = null;
  }
});

// Grid interactions
grid.addEventListener('mousedown', e => {
  if (!e.target.classList.contains('cell')) return;
  const idx = Array.from(grid.children).indexOf(e.target);

  if (toolSel.value === 'bucket') {
    const before = getSnapshot();
    floodFill(idx);
    const after = getSnapshot();
    recordPair(before, after);

  } else { // brush
    brushStartSnap = getSnapshot();
    paint(e.target);
  }
});

grid.addEventListener('mouseover', e => {
  if (mouseDown && toolSel.value === 'brush' && e.target.classList.contains('cell')) {
    paint(e.target);
  }
});

// Controls
sizeSlider.addEventListener('input', () => {
  const newSize = +sizeSlider.value;
  sizeValue.textContent = sizeValue2.textContent = newSize;
  createGrid(newSize);
  pushState();
});

clearBtn.addEventListener('click', () => {
  const before = getSnapshot();
  clearGrid();
  const after = getSnapshot();
  recordPair(before, after);
});

saveBtn.addEventListener('click', exportPNG);
undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  const defaultSize = 16;
  sizeSlider.value = defaultSize;
  sizeValue.textContent = sizeValue2.textContent = defaultSize;
  createGrid(defaultSize);
  pushState();
});