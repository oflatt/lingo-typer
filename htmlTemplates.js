export function quizQuestionHTML(score, total, english) {
  return `
    <div class="timer-container">
      <div id="timer-text"></div>
      <div id="timer-bar-container">
        <div id="timer-bar"></div>
      </div>
    </div>
    <p>Score: <strong>${score}</strong> / ${total}</p>
    <p>Translate to Italian: <strong>${english}</strong></p>
    <input type="text" id="answer-input" placeholder="Type in Italian..." autofocus autocomplete="off" spellcheck="false" />
    <p id="feedback"></p>
  `;
}

export function quizEndScreenHTML(score, prevHighScore) {
  return `
    <h3>⏰ Time's up!</h3>
    <p>You scored <strong>${score}</strong> points.</p>
    <p>High score: <strong>${Math.max(score, prevHighScore)}</strong></p>
    <button onclick="location.reload()">Back to Menu</button>
  `;
}

export function learnBatchIntroHTML(batch) {
  let html = `<h3>Study these words:</h3><ul>`;
  batch.forEach(({ english, italian }) => {
    html += `<li><strong>${english}</strong>: ${italian}</li>`;
  });
  html += `</ul><button id="start-typing-btn">Type them!</button>`;
  return html;
}

export function learnStep1HTML(english, italian, idx, total) {
  return `
    <h3>Step 1: Learn</h3>
    <p><strong>English:</strong> ${english}</p>
    <p><strong>Italian:</strong> ${italian}</p>
    <form id="step1-form">
      <label>Type Italian:</label>
      <input type="text" id="step1-input" autocomplete="off" spellcheck="false" />
      <button type="submit">Check</button>
      <span id="step1-feedback"></span>
    </form>
    <p>Word ${idx + 1} of ${total}</p>
  `;
}

export function learnStep2HTML(english, idx, total) {
  return `
    <h3>Step 2: Recall</h3>
    <p><strong>English:</strong> ${english}</p>
    <form id="step2-form">
      <label>Type Italian:</label>
      <input type="text" id="step2-input" autocomplete="off" spellcheck="false" />
      <button type="submit">Check</button>
      <span id="step2-feedback"></span>
    </form>
    <p>Word ${idx + 1} of ${total}</p>
  `;
}

export function learnStep2ResultsHTML(batch, order, results) {
  let html = `<h3>Step 2: Results</h3><ul>`;
  order.forEach((i, j) => {
    const { english, italian } = batch[i];
    const result = results[j];
    html += `<li><strong>${english}</strong>: ${result.correct ? "✅" : `❌ (${italian})`}</li>`;
  });
  html += `</ul><button id="next-batch-btn">Next 4 Words</button>`;
  return html;
}

export function doneScreenHTML() {
  return `
    <h3>🎉 Done!</h3>
    <p>You have reviewed all words in this category.</p>
    <button id="back-menu-btn">Back to Menu</button>
  `;
}
