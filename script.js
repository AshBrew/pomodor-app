let timerDuration = 25 * 60;
let timeLeft = timerDuration;
let timerInterval = null;
let currentMode = 'focus';

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const fullscreenBtn = document.getElementById('fullscreen');
const modeButtons = document.querySelectorAll('.modes button');

function updateDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  timerDisplay.textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alert(`${currentMode} session finished!`);
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  setMode(currentMode);
}

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

  if (mode === 'focus') timerDuration = 25 * 60;
  if (mode === 'short') timerDuration = 5 * 60;
  if (mode === 'long') timerDuration = 15 * 60;

  timeLeft = timerDuration;
  updateDisplay();
}

startBtn.addEventListener('click', () => {
  if (timerInterval) {
    pauseTimer();
    startBtn.textContent = "Start";
  } else {
    startTimer();
    startBtn.textContent = "Pause";
  }
});

resetBtn.addEventListener('click', resetTimer);

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setMode(btn.dataset.mode);
  });
});

updateDisplay();
