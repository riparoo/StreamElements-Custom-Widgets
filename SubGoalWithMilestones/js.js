const progressBar = document.getElementById('progress-bar');
const currentSubsEl = document.getElementById('current-subs');
const goalSubsEl = document.getElementById('goal-subs');
const celebrationEl = document.getElementById('celebration');

let goalSubs, currentSubs;
let milestones = [];

window.addEventListener('onWidgetLoad', function (obj) {
  const data = obj.detail.session.data;
  const fieldData = obj.detail.fieldData;

  currentSubs = data["subscriber-goal"]["amount"];
  goalSubs = fieldData["subGoal"];
  milestones = [];

  for (let i = 1; i <= 5; i++) {
    const num = parseInt(fieldData[`milestone${i}_number`]);
    const img = fieldData[`milestone${i}_image`] || null;
    const text = fieldData[`milestone${i}_text`] || null;
    const sound = fieldData[`milestone${i}_sound`] || null;

    if (!isNaN(num) && num > 0 && num < goalSubs) {
      milestones.push({ value: num, image: img, text, sound, el: null, reached: currentSubs >= num });
    }
  }

  milestones.push({
    value: goalSubs,
    image: fieldData.subGoalImage || null,
    text: fieldData.subGoal_text || null,
    sound: fieldData.subGoal_sound || null,
    el: null,
    reached: currentSubs >= goalSubs
  });

  goalSubsEl.textContent = goalSubs;
  requestAnimationFrame(() => {
    renderMilestones();
    updateProgress();
  });
});

function renderMilestones() {
  const container = document.querySelector('.progress-container');
  milestones.forEach(m => m.el?.remove());

  const containerWidth = container.offsetWidth;
  milestones.forEach(m => {
    const circle = document.createElement('div');
    circle.classList.add('milestone');
    const x = (m.value / goalSubs) * containerWidth;
    circle.style.left = `${x}px`;

    if (m.image) {
      const img = document.createElement('img');
      img.src = m.image;
      circle.appendChild(img);
    }

    if (m.text) {
      const textEl = document.createElement('div');
      textEl.classList.add('milestone-text');
      textEl.textContent = m.text;
      circle.appendChild(textEl);
    }

    container.appendChild(circle);
    m.el = circle;

    if (currentSubs >= m.value) {
      circle.classList.add('filled');
      m.reached = true;
    }
  });
}

function updateMilestones() {
  milestones.forEach(m => {
    if (!m.el) return;

    if (currentSubs >= m.value && !m.reached) {
      m.el.classList.add('filled');
      m.reached = true;

      const img = m.el.querySelector('img');
      if (img) img.style.opacity = '1';

      m.el.classList.add('pop');
      setTimeout(() => m.el.classList.remove('pop'), 600);

      triggerMilestoneConfetti(m);
      if (m.sound) {
        const url = typeof m.sound === 'string' ? m.sound : m.sound.url;
        if (url) {
          const audio = new Audio(url);
          audio.volume = 0.5;
          audio.play().catch(err => console.warn("Sound blocked:", err));
        }
      }
    } else if (currentSubs < m.value) {
      m.el.classList.remove('filled');
      m.reached = false;
      const img = m.el.querySelector('img');
      if (img) img.style.opacity = '0.3';
    }
  });
}

function updateProgress() {
  let percentage = (currentSubs / goalSubs) * 100;
  if (percentage > 0 && percentage < 2) percentage = 2;
  percentage = Math.min(percentage, 100);
  progressBar.style.width = `${percentage}%`;
  currentSubsEl.textContent = currentSubs;
  updateMilestones();
}

function handleNewSub(amount = 1) {
  currentSubs += amount;
  updateProgress();
}

function triggerMilestoneConfetti(milestone) {
  const milestoneRect = milestone.el.getBoundingClientRect();
  const containerRect = celebrationEl.getBoundingClientRect();

  const x = milestoneRect.left - containerRect.left + milestoneRect.width / 2;
  const y = milestoneRect.top - containerRect.top + milestoneRect.height / 2;

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti-big');
    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;
    confetti.style.backgroundColor = getRandomColor();

    const minAngle = -Math.PI / 6;
    const maxAngle = Math.PI / 6;
    const angle = Math.random() * (maxAngle - minAngle) + minAngle;

    const distance = 150 + Math.random() * 150;

    const dx = Math.sin(angle) * distance;
    const dy = -Math.cos(angle) * distance;

    confetti.style.setProperty('--x', `${dx}px`);
    confetti.style.setProperty('--y', `${dy}px`);
    confetti.style.animationDelay = `${Math.random() * 0.3}s`;

    celebrationEl.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove());
  }
}

function getRandomColor() {
  const colors = ['#9147ff', '#bf94ff', '#ff47b3', '#47ffb3', '#ffd747', '#47a1ff', '#ff6347'];
  return colors[Math.floor(Math.random() * colors.length)];
}

window.addEventListener('onEventReceived', function (obj) {
  const event = obj.detail.event;

  if (event.originalEventName !== 'subscriber-latest') return;

  if (event.isCommunityGift) return;

  let amountToAdd = 0;

  if (event.bulkGifted) {
    amountToAdd = event.amount;
  } else if (event.gifted) {
    amountToAdd = 1;
  } else {
    amountToAdd = 1;
  }

  if (amountToAdd > 0) {
    handleNewSub(amountToAdd);
  }
});