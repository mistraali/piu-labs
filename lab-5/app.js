import { store } from './store.js';
import './ui.js';

const addSquareBtn = document.getElementById('addSquare');
const addCircleBtn = document.getElementById('addCircle');
const recolorSquaresBtn = document.getElementById('recolorSquares');
const recolorCirclesBtn = document.getElementById('recolorCircles');
const board = document.querySelector('#board');

addSquareBtn.addEventListener('click', () => {
    store.addShape('square');
});

addCircleBtn.addEventListener('click', () => {
    store.addShape('circle');
});

recolorSquaresBtn.addEventListener('click', () => {
    store.recolorByType('square');
});

recolorCirclesBtn.addEventListener('click', () => {
    store.recolorByType('circle');
});

board.addEventListener('click', (event) => {
    const shapeEl = event.target.closest('.shape');
    if (!shapeEl || !board.contains(shapeEl)) return;
    const id = shapeEl.dataset.id;
    if (!id) return;
    store.removeShape(id);
});
