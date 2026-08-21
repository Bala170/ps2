const form = document.querySelector('#scenario-form');
const content = document.querySelector('#activity-content');
const emptyState = document.querySelector('#empty-state');
const statusPill = document.querySelector('#status-pill');
const image = document.querySelector('#scenario-image');
const imageAlt = document.querySelector('#image-alt');
const hotspotLayer = document.querySelector('#hotspot-layer');
const hotspotHint = document.querySelector('#hotspot-hint');
const question = document.querySelector('#question');
const context = document.querySelector('#context');
const options = document.querySelector('#options');
const feedback = document.querySelector('#feedback');
let currentScenario = null;

function setStatus(message, busy = false) {
  statusPill.textContent = message;
  statusPill.dataset.busy = busy;
}

function renderHotspots(hotspots = []) {
  hotspotLayer.replaceChildren();
  hotspots.forEach((hotspot) => {
    const button = document.createElement('button');
    button.className = 'hotspot';
    button.type = 'button';
    button.style.left = `${hotspot.x}%`;
    button.style.top = `${hotspot.y}%`;
    button.setAttribute('aria-label', `Explore ${hotspot.label}`);
    button.innerHTML = `<span>${hotspot.label}</span>`;
    button.addEventListener('click', () => {
      document.querySelectorAll('.hotspot').forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      hotspotHint.textContent = hotspot.meaning;
    });
    hotspotLayer.append(button);
  });
  hotspotHint.textContent = hotspots.length ? 'Tap a glowing point' : 'Look closely at the scene';
}

function renderScenario(scenario) {
  currentScenario = scenario;
  emptyState.hidden = true;
  content.hidden = false;
  document.querySelector('.scene-frame').hidden = !scenario.image_url;
  if (scenario.image_url) {
    image.src = scenario.image_url;
    image.alt = scenario.image_alt || 'Illustration for this learning scenario';
  } else {
    image.removeAttribute('src');
    image.alt = '';
  }
  imageAlt.textContent = scenario.image_alt || 'Explore the illustration before choosing an answer.';
  question.textContent = scenario.question;
  context.textContent = scenario.context;
  renderHotspots(scenario.hotspots);
  feedback.hidden = true;
  options.replaceChildren();
  Object.entries(scenario.options).forEach(([key, text]) => {
    const button = document.createElement('button');
    button.className = 'option';
    button.type = 'button';
    button.innerHTML = `<strong>${key}</strong><span>${text}</span>`;
    button.addEventListener('click', () => {
      document.querySelectorAll('.option').forEach((item) => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      feedback.hidden = false;
      const isCorrect = key === currentScenario.best_answer;
      feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
      feedback.textContent = isCorrect
        ? `Great thinking! That is a kind and helpful choice. ${currentScenario.explanation}`
        : 'Nice try! You are learning. Look at the picture once more and try another answer.';
    });
    options.append(button);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Making your scene...', true);
  const payload = {
    child_id: 'browser-child',
    age: Number(document.querySelector('#age').value),
    interest: document.querySelector('#interest').value.trim(),
    skill_level: 2,
    target_skill: document.querySelector('#target-skill').value.trim(),
    difficulty: Number(document.querySelector('#difficulty').value),
  };
  try {
    const response = await fetch('/api/v1/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Could not create a scene.');
    renderScenario(data);
    setStatus('Scene ready');
  } catch (error) {
    setStatus('Something went wrong');
    emptyState.hidden = false;
    content.hidden = true;
    emptyState.querySelector('h2').textContent = 'The scene needs another try';
    emptyState.querySelector('p').textContent = error.message;
  }
});
