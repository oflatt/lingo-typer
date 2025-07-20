import {
  quizQuestionHTML,
  quizEndScreenHTML,
  learnBatchIntroHTML,
  learnStep1HTML,
  learnStep2HTML,
  learnStep2ResultsHTML,
  doneScreenHTML
} from './htmlTemplates.js';

async function loadWords() {
  const response = await fetch("words.json");
  const wordsData = await response.json();
  return wordsData;
}

function createMainMenu(wordsData) {
  const levelButtons = document.getElementById("level-buttons");

  for (const level in wordsData) {
    const levelGroup = document.createElement("div");
    levelGroup.className = "level-group";

    const title = document.createElement("h2");
    title.textContent = `Level ${level}`;
    levelGroup.appendChild(title);

    const categories = wordsData[level];
    const catButtonContainer = document.createElement("div");
    catButtonContainer.className = "category-buttons";

    for (const category in categories) {
      // Quiz mode button
      const btnQuiz = document.createElement("button");
      btnQuiz.textContent = category;
      btnQuiz.addEventListener("click", () => {
        startGame(level, category, categories[category]);
      });
      catButtonContainer.appendChild(btnQuiz);

      // Learn mode button
      const btnLearn = document.createElement("button");
      btnLearn.textContent = `Learn: ${category}`;
      btnLearn.style.backgroundColor = "#859900";
      btnLearn.style.color = "white";
      btnLearn.addEventListener("click", () => {
        startLearnMode(level, category, categories[category]);
      });
      catButtonContainer.appendChild(btnLearn);
    }

    levelGroup.appendChild(catButtonContainer);
    levelButtons.appendChild(levelGroup);
  }
}

function startGame(level, category, wordList) {
  document.getElementById("main-menu").classList.add("hidden");
  const gameScreen = document.getElementById("game-screen");
  gameScreen.classList.remove("hidden");

  gameScreen.innerHTML = `
    <h2>${level} - ${category}</h2>
    <div id="quiz-container"></div>
  `;

  runQuiz(level, category, wordList);
}

function startLearnMode(level, category, wordList) {
  document.getElementById("main-menu").classList.add("hidden");
  const gameScreen = document.getElementById("game-screen");
  gameScreen.classList.remove("hidden");

  gameScreen.innerHTML = `
    <h2>${level} - Learn: ${category}</h2>
    <div id="learn-container"></div>
  `;

  runLearnMode(level, category, wordList);
}

function runQuiz(level, category, words) {
  const container = document.getElementById("quiz-container");

  let current = 0;
  let score = 0;
  const totalTime = 60 * 1000;
  const revealDelay = 7000;
  const startTime = Date.now();

  const highScoreKey = `highscore-${level}-${category}`;
  const prevHighScore = parseInt(localStorage.getItem(highScoreKey) || "0");

  let lastRevealTime = startTime;
  let revealed = false;
  let feedbackMsg = "";
  let answerSubmitted = false;
  let answerCorrect = false;
  let answerValue = "";

  // Speech synthesis for Italian word
  function speak(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'it-IT';
    speechSynthesis.speak(utterance);
  }

  function getTimeLeft() {
    return Math.max(0, totalTime - (Date.now() - startTime));
  }

  // Utility to remove accents from a string
  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function renderQuestion() {
    const { english, italian } = words[current];
    container.innerHTML = quizQuestionHTML(score, words.length, english);
    const input = document.getElementById("answer-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitAnswer();
    });
    input.addEventListener("input", () => {
      const userValue = input.value.trim().toLowerCase();
      const correctValue = italian.toLowerCase();
      if (
        removeAccents(userValue) === removeAccents(correctValue)
      ) {
        submitAnswer();
      }
    });
    input.focus();
    updateFeedback();
    updateTimerBar();
  }

  function renderEndScreen() {
    container.innerHTML = quizEndScreenHTML(score, prevHighScore);
    if (score > prevHighScore) {
      localStorage.setItem(highScoreKey, score);
    }
  }

  function updateTimerBar() {
    const timeLeft = getTimeLeft();
    const percent = (timeLeft / totalTime) * 100;
    const timerBar = document.getElementById("timer-bar");
    const timerText = document.getElementById("timer-text");
    if (timerBar) timerBar.style.width = `${percent}%`;
    if (timerText) timerText.textContent = `Time left: ${Math.ceil(timeLeft / 1000)}s`;
  }

  function updateFeedback() {
    const feedback = document.getElementById("feedback");
    if (feedback) feedback.textContent = feedbackMsg;
  }

  function revealAnswer() {
    if (!revealed) {
      const { italian } = words[current];
      feedbackMsg = `💡 Answer: ${italian}`;
      updateFeedback();
      speak(italian);
      revealed = true;
    }
  }

  function submitAnswer() {
    if (answerSubmitted) return;
    const { italian } = words[current];
    const input = document.getElementById("answer-input");
    if (!input) return;
    answerValue = input.value.trim().toLowerCase();
    answerSubmitted = true;
    revealed = true;
    clearInputEvents();

    if (
      removeAccents(answerValue) === removeAccents(italian.toLowerCase())
    ) {
      score++;
      feedbackMsg = "✅ Correct!";
      answerCorrect = true;
      speak(italian);
    } else {
      feedbackMsg = `❌ Wrong. Answer: ${italian}`;
      answerCorrect = false;
    }
    updateFeedback();

    setTimeout(() => {
      current++;
      resetForNext();
    }, 800);
  }

  function clearInputEvents() {
    const input = document.getElementById("answer-input");
    if (input) input.onkeydown = null;
  }

  function resetForNext() {
    lastRevealTime = Date.now();
    revealed = false;
    feedbackMsg = "";
    answerSubmitted = false;
    answerCorrect = false;
    answerValue = "";
    if (current < words.length && getTimeLeft() > 0) {
      renderQuestion();
      const input = document.getElementById("answer-input");
      if (input) input.focus();
    }
  }

  function gameLoop() {
    const timeLeft = getTimeLeft();
    if (timeLeft <= 0 || current >= words.length) {
      renderEndScreen();
      return;
    }

    updateTimerBar();

    if (!answerSubmitted && !revealed && Date.now() - lastRevealTime > revealDelay) {
      revealAnswer();
    }

    requestAnimationFrame(gameLoop);
  }

  // Initial render
  renderQuestion();
  requestAnimationFrame(gameLoop);
}

function runLearnMode(level, category, words) {
  const container = document.getElementById("learn-container");
  let current = 0;
  const batchSize = 4;

  // Utility to remove accents from a string
  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Speech synthesis for Italian word
  function speak(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'it-IT';
    speechSynthesis.speak(utterance);
  }

  function renderBatchIntro() {
    const batch = words.slice(current, current + batchSize);
    if (batch.length === 0) {
      container.innerHTML = doneScreenHTML();
      const btn = document.getElementById("back-menu-btn");
      if (btn) btn.onclick = () => location.reload();
      return;
    }
    renderStep1(batch, 0);
  }

  // Step 1: Show each word, user types Italian, show answer after submit
  function renderStep1(batch, idx) {
    if (idx >= batch.length) {
      renderStep2(batch, shuffleArray([...Array(batch.length).keys()]), 0, []);
      return;
    }
    const { english, italian } = batch[idx];
    container.innerHTML = learnStep1HTML(english, italian, idx, batch.length);
    speak(italian);
    const input = document.getElementById("step1-input");
    const feedback = document.getElementById("step1-feedback");
    let answered = false;

    function showFeedback(msg, color) {
      feedback.textContent = msg;
      feedback.style.color = color;
      feedback.style.opacity = "1";
      setTimeout(() => {
        feedback.style.opacity = "0";
        setTimeout(() => renderStep1(batch, idx + 1), 300);
      }, 1000);
    }

    input.addEventListener("input", () => {
      if (answered) return;
      const userValue = input.value.trim().toLowerCase();
      if (!userValue) return; // Don't advance for empty answers
      const correctValue = italian.toLowerCase();
      if (removeAccents(userValue) === removeAccents(correctValue)) {
        answered = true;
        input.disabled = true;
        showFeedback("✅", "green");
      }
    });

    document.getElementById("step1-form").onsubmit = function(e) {
      e.preventDefault();
      if (answered) return;
      const userValue = input.value.trim().toLowerCase();
      if (!userValue) return; // Don't advance for empty answers
      const correctValue = italian.toLowerCase();
      if (removeAccents(userValue) === removeAccents(correctValue)) {
        answered = true;
        input.disabled = true;
        showFeedback("✅", "green");
      } else {
        answered = true;
        input.disabled = true;
        showFeedback(`❌ (${italian})`, "red");
      }
    };
    input.focus();
  }

  // Step 2: Show only English, user types Italian, random order
  function renderStep2(batch, order, idx, results) {
    if (idx >= batch.length) {
      const incorrectIndices = order.filter((i, j) => !results[j].correct);
      if (incorrectIndices.length > 0) {
        const retryBatch = incorrectIndices.map(i => batch[i]);
        container.innerHTML = learnStep2ResultsHTML(batch, order, results) +
          `<p style="color:#b71c1c;font-weight:bold;">Try again for incorrect answers!</p>`;
        const btn = document.getElementById("next-batch-btn");
        if (btn) btn.onclick = () => renderStep1(retryBatch, 0);
        // Advance on Enter
        document.onkeydown = function(e) {
          if (e.key === "Enter") {
            renderStep1(retryBatch, 0);
          }
        };
      } else {
        container.innerHTML = learnStep2ResultsHTML(batch, order, results);
        const btn = document.getElementById("next-batch-btn");
        if (btn) btn.onclick = () => {
          current += batchSize;
          renderBatchIntro();
        };
        // Advance on Enter
        document.onkeydown = function(e) {
          if (e.key === "Enter") {
            current += batchSize;
            renderBatchIntro();
          }
        };
      }
      return;
    }
    const i = order[idx];
    const { english, italian } = batch[i];
    container.innerHTML = learnStep2HTML(english, idx, batch.length);
    const input = document.getElementById("step2-input");
    const feedback = document.getElementById("step2-feedback");
    let answered = false;

    function showFeedback(msg, color, correct) {
      feedback.textContent = msg;
      feedback.style.color = color;
      feedback.style.opacity = "1";
      speak(italian);
      setTimeout(() => {
        feedback.style.opacity = "0";
        setTimeout(() => renderStep2(batch, order, idx + 1, [...results, { correct }]), 300);
      }, 1000);
    }

    input.addEventListener("input", () => {
      if (answered) return;
      const userValue = input.value.trim().toLowerCase();
      if (!userValue) return; // Don't advance for empty answers
      const correctValue = italian.toLowerCase();
      if (removeAccents(userValue) === removeAccents(correctValue)) {
        answered = true;
        input.disabled = true;
        showFeedback("✅", "green", true);
      }
    });

    document.getElementById("step2-form").onsubmit = function(e) {
      e.preventDefault();
      if (answered) return;
      const userValue = input.value.trim().toLowerCase();
      if (!userValue) return; // Don't advance for empty answers
      const correctValue = italian.toLowerCase();
      if (removeAccents(userValue) === removeAccents(correctValue)) {
        answered = true;
        input.disabled = true;
        showFeedback("✅", "green", true);
      } else {
        answered = true;
        input.disabled = true;
        showFeedback(`❌ (${italian})`, "red", false);
      }
    };
    input.focus();
  }

  // Fisher-Yates shuffle
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  renderBatchIntro();
}

document.addEventListener("DOMContentLoaded", async () => {
  const wordsData = await loadWords();
  createMainMenu(wordsData);
});
