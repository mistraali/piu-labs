// Generowanie ID dla kart
function generateId() {
    return 'card-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}

// Generowanie koloru
function randomHsl() {
    return `hsl(${Math.floor(Math.random() * 360)}, 90%, 70%)`;
}

// Uaktualnie licznika kart w kolumnie
function updateColumnCounter(column) {
    const counter = column.querySelector('.card-counter');
    if (!counter) return;
    const count = column.querySelectorAll('.card').length;
    counter.textContent = `Karty: ${count}`;
}

// Odzyskiwanie daty z ID karty do sortowania
function getCardTimestamp(card) {
    const id = card.dataset.id || '';
    const parts = id.split('-');
    if (parts.length < 3) return 0;
    const ts = parseInt(parts[1], 10);
    if (Number.isNaN(ts)) return 0;
    return ts;
}

// Odzyskiwanie tekstu karty do sortowania
function getCardText(card) {
    const textEl = card.querySelector('.text');
    if (!textEl) return '';
    return textEl.textContent.trim().toLowerCase();
}

// Sortowanie kolumny 4 metodami
function sortColumnCards(column, mode, direction) {
    const list = column.querySelector('.card-list');
    if (!list) return;
    const cards = Array.from(list.querySelectorAll('.card'));

    cards.sort((a, b) => {
        let result = 0;
        if (mode === 'date') {
            result = getCardTimestamp(a) - getCardTimestamp(b);
        } else if (mode === 'text') {
            result = getCardText(a).localeCompare(getCardText(b), 'pl');
        }
        return direction === 'desc' ? -result : result;
    });

    cards.forEach((card) => list.appendChild(card));
}

// Obsługa zdarzenia załadowania strony
document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'kanban-board';
    const kanban = document.querySelector('.kanban');

    const columns = Array.from(kanban.querySelectorAll('.column'));

    // Zapisywanie danych do local storage
    function saveBoard() {
        const data = columns.map((column) => ({
            status: column.dataset.status,
            cards: Array.from(column.querySelectorAll('.card')).map((card) => ({
                id: card.dataset.id,
                color: card.style.backgroundColor,
                text: card.querySelector('.text')?.textContent || '',
            })),
        }));

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Tworzenie lub odtwarzanie karty
    function createCard(column, cardData) {
        const list = column.querySelector('.card-list');
        if (!list) return;

        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = cardData?.id || generateId();
        card.style.backgroundColor = cardData?.color || randomHsl();

        const text = document.createElement('div');
        text.className = 'text';
        text.contentEditable = 'true';
        text.textContent = cardData?.text || 'Nowa karta';
        text.title = 'Edytuj kartę';

        const close = document.createElement('button');
        close.className = 'close';
        close.textContent = 'x';
        close.title = 'Usuń kartę';

        const left = document.createElement('button');
        left.className = 'left';
        left.textContent = '←';
        left.title = 'Przenieś w lewo';

        const right = document.createElement('button');
        right.className = 'right';
        right.textContent = '→';
        right.title = 'Przenieś w prawo';

        const colorCard = document.createElement('button');
        colorCard.className = 'color-card';
        colorCard.textContent = '🎨';
        colorCard.title = 'Koloruj';

        // Ukrywanie strzałek
        const columnIndex = columns.indexOf(column);
        left.style.visibility = columnIndex === 0 ? 'hidden' : 'visible';
        right.style.visibility =
            columnIndex === columns.length - 1 ? 'hidden' : 'visible';

        card.append(left, right, close, colorCard, text);

        // Animacja
        card.classList.add('pop');

        list.appendChild(card);
        updateColumnCounter(column);
        return card;
    }

    // Wczytywanie kart z local storage
    function loadBoard() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);

        data.forEach((colData) => {
            const column = columns.find(
                (c) => c.dataset.status === colData.status
            );
            const cards = colData.cards;
            cards.forEach((cardData) => createCard(column, cardData));
        });

        columns.forEach((column) => updateColumnCounter(column));
    }

    // Wczytanie całej tablicy
    loadBoard();
    columns.forEach((column) => updateColumnCounter(column));

    // Nasłuch przy edycji tekstu
    kanban.addEventListener(
        'blur',
        (event) => {
            if (event.target.classList.contains('text')) {
                saveBoard();
            }
        },
        true
    );

    //kanban.addEventListener('click', (event) => {});

    // Delegacja do każdej kolumny nasłuchu kliknięcia
    columns.forEach((column) => {
        column.addEventListener('click', (event) => {
            // "Dodaj kartę"
            const addButton = event.target.closest('.add-card');
            if (addButton) {
                createCard(addButton.closest('.column'), null);
                saveBoard();
                return;
            }

            // "Koloruj kolumnę"
            const colorColumnButton = event.target.closest('.color-column');
            if (colorColumnButton) {
                const column = colorColumnButton.closest('.column');
                const cards = column.querySelectorAll('.card');
                cards.forEach((card) => {
                    card.style.backgroundColor = randomHsl();
                });
                saveBoard();
                return;
            }

            // "Sortuj chronologicznie"
            const sortDateAsc = event.target.closest('.sort-date-asc');
            if (sortDateAsc) {
                sortColumnCards(column, 'date', 'asc');
                saveBoard();
                return;
            }

            // "Sortuj odwrotnie chronologicznie"
            const sortDateDesc = event.target.closest('.sort-date-desc');
            if (sortDateDesc) {
                sortColumnCards(column, 'date', 'desc');
                saveBoard();
                return;
            }

            // "Sortuj alfabetycznie"
            const sortTextAsc = event.target.closest('.sort-text-asc');
            if (sortTextAsc) {
                sortColumnCards(column, 'text', 'asc');
                saveBoard();
                return;
            }

            // "Sortuj odwrotnie alfabetycznie"
            const sortTextDesc = event.target.closest('.sort-text-desc');
            if (sortTextDesc) {
                sortColumnCards(column, 'text', 'desc');
                saveBoard();
                return;
            }

            // "Usuń kartę"
            const closeButton = event.target.closest('.close');
            if (closeButton) {
                const card = closeButton.closest('.card');
                if (card) {
                    card.classList.add('pop-out');
                    setTimeout(() => {
                        card.remove();
                        const col = column;
                        updateColumnCounter(col);
                        saveBoard();
                    }, 200);
                }
                return;
            }

            // "Przenieś w lewo"
            const leftButton = event.target.closest('.left');
            if (leftButton) {
                const card = leftButton.closest('.card');
                const currentColumn = card.closest('.column');

                const index = columns.indexOf(currentColumn);
                if (index <= 0) return;

                const targetColumn = columns[index - 1];
                const targetList = targetColumn.querySelector('.card-list');
                targetList.appendChild(card);
                updateColumnCounter(currentColumn);
                updateColumnCounter(targetColumn);

                const left = card.querySelector('.left');
                const right = card.querySelector('.right');

                if (left) {
                    left.style.visibility =
                        index - 1 === 0 ? 'hidden' : 'visible';
                }
                if (right) {
                    right.style.visibility =
                        index - 1 === 2 ? 'hidden' : 'visible';
                }

                saveBoard();
                return;
            }

            // "Przenieś w prawo"
            const rightButton = event.target.closest('.right');
            if (rightButton) {
                const card = rightButton.closest('.card');
                const currentColumn = card.closest('.column');

                const index = columns.indexOf(currentColumn);
                if (index >= 2) return;

                const targetColumn = columns[index + 1];
                const targetList = targetColumn.querySelector('.card-list');
                targetList.appendChild(card);
                updateColumnCounter(currentColumn);
                updateColumnCounter(targetColumn);

                const left = card.querySelector('.left');
                const right = card.querySelector('.right');

                if (left) {
                    left.style.visibility =
                        index + 1 === 0 ? 'hidden' : 'visible';
                }
                if (right) {
                    right.style.visibility =
                        index + 1 === 2 ? 'hidden' : 'visible';
                }

                saveBoard();
                return;
            }

            // "Koloruj kartę"
            const colorCardButton = event.target.closest('.color-card');
            if (colorCardButton) {
                const card = colorCardButton.closest('.card');
                card.style.backgroundColor = randomHsl();
                saveBoard();
                return;
            }
        });
    });
});
