import { randomHsl, generateId } from './helpers.js';

const STORAGE_KEY = 'shapes-board';

class Store {
    #shapes = [];
    #subscribers = new Set();

    constructor() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        this.#shapes = Array.isArray(data) ? data : [];
    }

    #save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#shapes));
    }

    #notify() {
        for (const cb of this.#subscribers) {
            cb(this.getState());
        }
    }

    getState() {
        let squares = 0;
        let circles = 0;

        for (const s of this.#shapes) {
            if (s.type === 'square') squares++;
            else if (s.type === 'circle') circles++;
        }

        return {
            shapes: this.#shapes.map((s) => ({ ...s })),
            squaresCount: squares,
            circlesCount: circles,
        };
    }

    subscribe(callback) {
        this.#subscribers.add(callback);
        callback(this.getState());
        return () => this.#subscribers.delete(callback);
    }

    addShape(type) {
        const shape = {
            id: generateId(),
            type,
            color: randomHsl(),
        };
        this.#shapes.push(shape);
        this.#save();
        this.#notify();
    }

    removeShape(id) {
        const idStr = String(id);
        const next = this.#shapes.filter((s) => String(s.id) !== idStr);
        if (next.length === this.#shapes.length) return;
        this.#shapes = next;
        this.#save();
        this.#notify();
    }

    recolorByType(type) {
        let changed = false;
        for (const shape of this.#shapes) {
            if (shape.type === type) {
                shape.color = randomHsl();
                changed = true;
            }
        }
        if (!changed) return;
        this.#save();
        this.#notify();
    }
}

export const store = new Store();
