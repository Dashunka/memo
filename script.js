const cardsArray = [
    { name: 'apteka', desc: 'Аптека', img: 'img/apteka.jpg' },
    { name: 'aptekaiparfum', desc: 'Аптека и Парфюмерный магазин Шлезингера', img: 'img/aptekaiparfum.jpg' },
    { name: 'dobronravov', desc: 'Николай Николаевич Добронравов ', img: 'img/dobronravov.jpg' },
    { name: 'dohodnii', desc: 'Доходный дом братьев Соколовых', img: 'img/dohodnii.jpg' },
    { name: 'glier', desc: 'Рейнгольд Морицевич Глиэр', img: 'img/glier.jpg' },
    { name: 'hram', desc: 'Храм Петра и Павла', img: 'img/hram.jpg' },
    { name: 'konka', desc: 'Конка', img: 'img/konka.jpg' },
    { name: 'lomakin_skver', desc: 'Сквер Ю.С.Ломакина', img: 'img/lomakin_skver.jpg' },
    { name: 'malahovskoe', desc: 'Малаховское озеро', img: 'img/malahovskoe.jpg' },
    { name: 'ovrag', desc: 'Школа над оврагом', img: 'img/ovrag.jpg' },
    { name: 'petropavlovskii', desc: 'Петропавловский парк', img: 'img/petropavlovskii.png' },
    { name: 'shpigel', desc: 'Федор Иванович Шпигель', img: 'img/shpigel.jpg' },
    { name: 'skver_pobedi', desc: 'Сквер Победы', img: 'img/skver_pobedi.jpg' },
    { name: 'teleshov', desc: 'Николай Дмитриевич Телешов', img: 'img/teleshov.jpg' },
    { name: 'theater', desc: 'Летний Театр', img: 'img/theater.jpg' },
    { name: 'urii_lomakin', desc: 'Юрий Ломакин', img: 'img/urii_lomakin.jpg' }
];

function preloadImages() {
    cardsArray.forEach(item => {
        const img = new Image();
        img.src = item.img;
    });
    console.log("Начата фоновая загрузка картинок...");
}

preloadImages();

// Переменные состояния
let totalPlayers = 1;
let currentPlayer = 1;
let scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
let gameDeck = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let pairsFound = 0;
const totalPairs = 16;

// --- DOM Элементы ---
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const grid = document.getElementById('grid');
const startBtn = document.getElementById('start-btn');
const modalOverlay = document.getElementById('modal-overlay');
const btns = document.querySelectorAll('.select-btn');

// --- НАСТРОЙКА ИГРЫ ---

// Выбор количества игроков
btns.forEach(btn => {
    btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        totalPlayers = parseInt(btn.dataset.players);
        startBtn.disabled = false;
    });
});

// Старт
startBtn.addEventListener('click', () => {
    setupScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    initGame();
});

function initGame() {
    // 1. Показываем нужные счета
    for (let i = 1; i <= 4; i++) {
        const scoreEl = document.getElementById(`p${i}-score`);
        if (i <= totalPlayers) {
            scoreEl.classList.add('visible');
        } else {
            scoreEl.classList.remove('visible');
        }
    }
    updateUI();

    // 2. Генерация колоды (дублируем массив и перемешиваем)
    gameDeck = [...cardsArray, ...cardsArray];
    gameDeck.sort(() => 0.5 - Math.random());

    // 3. Создание карт на поле
    grid.innerHTML = '';
    gameDeck.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.name = item.name; // Для сверки
        card.dataset.desc = item.desc;
        card.dataset.img = item.img;

        // Внутренняя структура карты
        card.innerHTML = `
            <div class="front"></div>
            <div class="back">
                <img src="${item.img}" alt="${item.name}">
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

// --- ЛОГИКА ХОДОВ ---

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        // Первый клик
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    // Второй клик
    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    lockBoard = true; // Блокируем пока смотрим попап
    
    // Начисляем очки
    scores[currentPlayer]++;
    pairsFound++;
    updateUI();

    // Ждем окончания анимации переворота (0.5 сек) и показываем попап
    setTimeout(() => {
        showModal(firstCard.dataset.img, firstCard.dataset.desc);
    }, 500);
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
        nextTurn(); // Переход хода
    }, 1000);
}

function nextTurn() {
    if (totalPlayers > 1) {
        currentPlayer++;
        if (currentPlayer > totalPlayers) currentPlayer = 1;
        updateUI();
    }
}

function updateUI() {
    // Обновляем текст хода
    const turnDisplay = document.getElementById('turn-display');
    if (totalPlayers === 1) {
        turnDisplay.textContent = "Ваш ход";
    } else {
        turnDisplay.textContent = `Ход: Игрок ${currentPlayer}`;
    }

    // Обновляем очки и подсветку активного игрока
    for (let i = 1; i <= totalPlayers; i++) {
        const scoreEl = document.getElementById(`p${i}-score`);
        scoreEl.textContent = `Игрок ${i}: ${scores[i]}`;
        
        if (i === currentPlayer) {
            scoreEl.classList.add('active');
        } else {
            scoreEl.classList.remove('active');
        }
    }
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// --- МОДАЛЬНОЕ ОКНО ---

function showModal(imgSrc, descText) {
    const img = document.getElementById('modal-img');
    const desc = document.getElementById('modal-desc');
    const hint = document.querySelector('.modal-hint');

    img.src = imgSrc;
    desc.textContent = descText;
    
    // Проверка на конец игры для текста
    if (pairsFound === totalPairs) {
        hint.textContent = "Нажмите, чтобы увидеть результаты";
    } else {
        hint.textContent = "Нажмите, чтобы продолжить";
    }

    modalOverlay.style.display = 'flex';
}

// Закрытие модалки по клику
modalOverlay.addEventListener('click', () => {
    modalOverlay.style.display = 'none';

    if (pairsFound === totalPairs) {
        finishGame();
    } else {
        // Игра продолжается, ход остается у угадавшего
        resetBoard();
    }
});

function finishGame() {
    let msg = '';
    const desc = document.getElementById('modal-desc');
    const img = document.getElementById('modal-img');
    const hint = document.querySelector('.modal-hint');

    img.style.display = 'none'; // Скрываем картинку для финала
    hint.textContent = "Нажмите, чтобы перезагрузить";

    if (totalPlayers === 1) {
        msg = "Все пары найдены! Ты молодец!";
    } else {
        // Ищем победителя
        let maxScore = -1;
        let winners = [];
        for (let i = 1; i <= totalPlayers; i++) {
            if (scores[i] > maxScore) {
                maxScore = scores[i];
                winners = [i];
            } else if (scores[i] === maxScore) {
                winners.push(i);
            }
        }

        if (winners.length === 1) {
            msg = `Победил Игрок ${winners[0]}! Поздравляем!`;
        } else {
            msg = `Ничья между игроками: ${winners.join(', ')}!`;
        }
    }

    desc.textContent = msg;
    modalOverlay.style.display = 'flex';
    
    // Перезагрузка по клику
    modalOverlay.onclick = () => location.reload();
}