import { store } from './store.js';

const cntSquaresEl = document.getElementById('cntSquares');
const cntCirclesEl = document.getElementById('cntCircles');
const boardEl = document.getElementById('board');

const shapeElements = new Map();

function createShapeElement(shape) {
    const el = document.createElement('div');
    el.dataset.id = String(shape.id);
    return el;
}

function render(state) {
    const { shapes, squaresCount, circlesCount } = state;

    const nextById = new Map(shapes.map((s) => [String(s.id), s]));

    for (const [id, el] of shapeElements) {
        if (!nextById.has(id)) {
            el.remove();
            shapeElements.delete(id);
        }
    }

    for (const shape of shapes) {
        const id = String(shape.id);
        let el = shapeElements.get(id);
        if (!el) {
            el = createShapeElement(shape);
            shapeElements.set(id, el);
            boardEl.appendChild(el);
        }
        el.className = `shape ${shape.type}`;
        el.style.backgroundColor = shape.color;
    }

    cntSquaresEl.textContent = String(squaresCount);
    cntCirclesEl.textContent = String(circlesCount);
}

store.subscribe(render);
