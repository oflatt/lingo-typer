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
      const btn = document.createElement("button");
      btn.textContent = category;
      btn.addEventListener("click", () => {
        startGame(level, category, categories[category]);
      });
      catButtonContainer.appendChild(btn);
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

  runQuiz(wordList);
}

function runQuiz(words) {
  const container = document.getElementById("quiz-container");
  let current = 0;

  const render = () => {
    if (current >= words.length) {
      container.innerHTML = "<h3>Well done! 🎉</h3>";
      return;
    }

    const { english, italian } = words[current];
    container.innerHTML = `
      <p>Translate to Italian: <strong>${english}</strong></p>
      <input type="text" id="answer-input" placeholder="Type in Italian..." />
      <button id="submit-btn">Submit</button>
      <p id="feedback"></p>
    `;

    document.getElementById("submit-btn").addEventListener("click", () => {
      const input = document.getElementById("answer-input").value.trim().toLowerCase();
      const feedback = document.getElementById("feedback");

      if (input === italian.toLowerCase()) {
        feedback.textContent = "✅ Correct!";
        setTimeout(() => {
          current++;
          render();
        }, 800);
      } else {
        feedback.textContent = `❌ Try again. The correct word is: "${italian}"`;
      }
    });
  };

  render();
}

document.addEventListener("DOMContentLoaded", async () => {
  const wordsData = await loadWords();
  createMainMenu(wordsData);
});
