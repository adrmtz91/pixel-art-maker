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
