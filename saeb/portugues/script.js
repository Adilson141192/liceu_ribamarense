/* SAEB Game Script with Enhanced Features */
const GAME_CONFIG = {
    totalQuestions: 10,
    timePerQuestion: { "2": 45, "5": 35, "9": 25 },
    baseScore: 10
};

const STORAGE_KEY = "saebRanking";

const gameState = {
    currentQuestion: 0,
    score: 0,
    timer: null,
    timeLeft: 0,
    currentYear: "2",
    isPlaying: false,
    currentQuestionObj: null,
    usedQuestions: { "2": [], "5": [], "9": [] }
};

const DOM = {
    startScreen: document.getElementById("start-screen"),
    gameScreen: document.getElementById("game-screen"),
    endScreen: document.getElementById("end-screen"),
    rankingScreen: document.getElementById("ranking-screen"),
    startButton: document.getElementById("start-button"),
    rankingButton: document.getElementById("ranking-button"),
    rankingBack: document.getElementById("ranking-back"),
    rankingList: document.getElementById("ranking-list"),
    yearButtons: document.querySelectorAll(".year-btn"),
    question: document.getElementById("question"),
    options: document.getElementById("options"),
    timerText: document.querySelector("#timer span"),
    scoreText: document.querySelector("#score span"),
    questionCounter: document.querySelector("#question-counter span"),
    feedback: document.getElementById("feedback"),
    finalScore: document.getElementById("final-score"),
    restartButton: document.getElementById("restart-button"),
    backToMenu: document.getElementById("back-to-menu"),
    nextButton: document.getElementById("next-button"),
    headerBackButton: document.getElementById("header-back-button")
};

/* ---------- INITIALIZATION ---------- */
function init() {
    setupEventListeners();
    setYear("2");
    updateRankingScreen();
}

function setupEventListeners() {
    DOM.startButton.addEventListener("click", startGame);
    DOM.restartButton.addEventListener("click", restartGame);
    DOM.backToMenu.addEventListener("click", returnToMenu);
    DOM.rankingButton.addEventListener("click", showRankingMenu);
    DOM.rankingBack.addEventListener("click", returnToMenu);
    DOM.headerBackButton.addEventListener("click", returnToMenu);
    DOM.nextButton.addEventListener("click", nextQuestion);

    DOM.yearButtons.forEach(btn => {
        btn.addEventListener("click", () => setYear(btn.dataset.year));
        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                setYear(btn.dataset.year);
            }
        });
    });
}

/* ---------- GAME SETUP ---------- */
function setYear(year) {
    gameState.currentYear = year;
    DOM.yearButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.year === year);
        btn.setAttribute("aria-pressed", btn.dataset.year === year);
    });
}

function showRankingMenu() {
    hideAllScreens();
    updateRankingScreen();
    DOM.rankingScreen.style.display = "block";
}

/* ---------- GAME LOGIC ---------- */
function startGame() {
    hideAllScreens();
    DOM.gameScreen.style.display = "block";
    resetGame();
    loadQuestion();
}

function resetGame() {
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.timeLeft = GAME_CONFIG.timePerQuestion[gameState.currentYear];
    gameState.isPlaying = true;
    gameState.usedQuestions = { "2": [], "5": [], "9": [] };

    updateScore();
    updateQuestionCounter();
}

function loadQuestion() {
    if (gameState.currentQuestion >= GAME_CONFIG.totalQuestions) {
        endGame();
        return;
    }

    DOM.question.textContent = "Carregando pergunta...";
    DOM.options.innerHTML = "";
    DOM.nextButton.style.display = "none";
    DOM.feedback.textContent = "";
    DOM.feedback.className = "feedback-card";

    const availableQuestions = SAEB_QUESTIONS[gameState.currentYear].filter(
        q => !gameState.usedQuestions[gameState.currentYear].includes(q.question)
    );

    if (availableQuestions.length === 0) {
        gameState.usedQuestions[gameState.currentYear] = [];
        loadQuestion();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    gameState.currentQuestionObj = availableQuestions[randomIndex];
    gameState.usedQuestions[gameState.currentYear].push(
        gameState.currentQuestionObj.question
    );

    displayQuestion();
    startTimer();
}

function displayQuestion() {
    DOM.question.textContent = gameState.currentQuestionObj.question;
    DOM.options.innerHTML = "";

    gameState.currentQuestionObj.options.forEach((option, index) => {
        if (typeof option !== 'string') return; // Skip invalid options
        
        const button = document.createElement("button");
        button.className = "option";
        button.textContent = option;
        button.setAttribute("role", "option");
        button.setAttribute("aria-label", `Opção ${index + 1}: ${option}`);
        button.addEventListener("click", () => 
            checkAnswer(index === gameState.currentQuestionObj.correct)
        );
        button.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                checkAnswer(index === gameState.currentQuestionObj.correct);
            }
        });
        DOM.options.appendChild(button);
    });

    updateQuestionCounter();
}

function checkAnswer(isCorrect) {
    if (!gameState.isPlaying) return;

    gameState.isPlaying = false;
    clearInterval(gameState.timer);

    if (isCorrect) {
        const timeBonus = Math.floor(gameState.timeLeft / 5);
        gameState.score += GAME_CONFIG.baseScore + timeBonus;
        updateScore();
        DOM.feedback.textContent = `✅ Correto! +${timeBonus} bônus! ${gameState.currentQuestionObj.explanation}`;
        DOM.feedback.className = "feedback-card correct";
    } else {
        const correctOption = gameState.currentQuestionObj.options[gameState.currentQuestionObj.correct];
        DOM.feedback.textContent = `❌ Incorreto! A resposta correta é: "${correctOption}". ${gameState.currentQuestionObj.explanation}`;
        DOM.feedback.className = "feedback-card incorrect";
    }

    DOM.nextButton.style.display = "block";
}

function nextQuestion() {
    gameState.currentQuestion++;
    gameState.isPlaying = true;
    loadQuestion();
}

function startTimer() {
    gameState.timeLeft = GAME_CONFIG.timePerQuestion[gameState.currentYear];
    DOM.timerText.textContent = gameState.timeLeft;

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        DOM.timerText.textContent = gameState.timeLeft;

        DOM.timer.className = "game-timer";
        if (gameState.timeLeft <= 10) DOM.timer.classList.add("warning");
        if (gameState.timeLeft <= 5) {
            DOM.timer.classList.remove("warning");
            DOM.timer.classList.add("critical");
        }

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeOut();
        }
    }, 1000);
}

function timeOut() {
    gameState.isPlaying = false;
    DOM.feedback.textContent = "⏰ Tempo esgotado!";
    DOM.feedback.className = "feedback-card incorrect";
    DOM.nextButton.style.display = "block";
}

/* ---------- UI UPDATES ---------- */
function updateScore() { 
    DOM.scoreText.textContent = gameState.score;
    DOM.scoreText.setAttribute("aria-label", `Pontuação: ${gameState.score}`);
}

function updateQuestionCounter() {
    const counterText = `${gameState.currentQuestion + 1}/${GAME_CONFIG.totalQuestions}`;
    DOM.questionCounter.textContent = counterText;
    DOM.questionCounter.setAttribute("aria-label", `Pergunta ${gameState.currentQuestion + 1} de ${GAME_CONFIG.totalQuestions}`);
}

function hideAllScreens() {
    DOM.startScreen.style.display = "none";
    DOM.gameScreen.style.display = "none";
    DOM.endScreen.style.display = "none";
    DOM.rankingScreen.style.display = "none";
}

/* ---------- GAME END & RANKING ---------- */
function endGame() {
    hideAllScreens();
    DOM.endScreen.style.display = "block";
    DOM.finalScore.textContent = gameState.score;
    DOM.finalScore.setAttribute("aria-label", `Pontuação final: ${gameState.score}`);

    setTimeout(() => {
        const playerName = prompt("Digite seu nome para o ranking:", "Anônimo")?.trim() || "Anônimo";
        if (playerName) {
            saveScore(playerName);
        }
        updateRankingScreen();
    }, 500);
}

function saveScore(name) {
    const ranking = loadRanking();
    const today = new Date().toISOString().split('T')[0];
    
    ranking.push({ 
        name, 
        year: gameState.currentYear, 
        score: gameState.score,
        date: today
    });

    ranking.sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date));
    const topTen = ranking.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topTen));
}

function loadRanking() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function updateRankingScreen() {
    const ranking = loadRanking();
    DOM.rankingList.innerHTML = "";
    
    if (ranking.length === 0) {
        DOM.rankingList.innerHTML = "<li>Nenhum resultado ainda.</li>";
        return;
    }
    
    ranking.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${item.name} – ${item.year}º Ano – ${item.score} pts`;
        li.setAttribute("aria-label", `Posição ${index + 1}: ${item.name}, ${item.year}º ano, ${item.score} pontos`);
        DOM.rankingList.appendChild(li);
    });
}

/* ---------- NAVIGATION ---------- */
function restartGame() { 
    startGame(); 
}

function returnToMenu(e) {
    if (e) e.preventDefault();
    hideAllScreens();
    DOM.startScreen.style.display = "block";
}

/* ---------- LAUNCH ---------- */
document.addEventListener("DOMContentLoaded", init);