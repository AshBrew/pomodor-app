document.addEventListener('DOMContentLoaded', () => {
  // ---------- state ----------
  let durations = { focus: 25, short: 5, long: 15 }; // minutes
  let timerDuration = durations.focus * 60;
  let timeLeft = timerDuration;
  let timerInterval = null;
  let currentMode = 'focus';

  // ---------- DOM selectors (with fallbacks) ----------
  const timerDisplay = document.getElementById('timer');
  const startBtn = document.getElementById('start');
  const resetBtn = document.getElementById('reset');
  const fullscreenBtn = document.getElementById('fullscreen');
  const modeButtons = document.querySelectorAll('.modes button');

  const settingsBtn = document.getElementById('settingsBtn')
    || document.querySelector('.toolbar button:nth-child(2)')
    || document.querySelector('[data-settings]');
  const settingsModal = document.getElementById('settingsModal') || document.querySelector('.modal');
  const modalContent = settingsModal ? settingsModal.querySelector('.modal-content') : null;

  // inputs (fallbacks)
  const focusInput = document.getElementById('focusInput') || (modalContent && modalContent.querySelector('input[name="focus"]'));
  const shortInput = document.getElementById('shortInput') || (modalContent && modalContent.querySelector('input[name="short"]'));
  const longInput = document.getElementById('longInput') || (modalContent && modalContent.querySelector('input[name="long"]'));

  // save button fallback: first look for matching id, otherwise use last button inside modal-content
  let saveSettingsBtn = document.getElementById('saveSettings')
    || (modalContent && modalContent.querySelector('button#saveSettings'))
    || (modalContent && modalContent.querySelector('button[type="button"]'))
    || (modalContent && modalContent.querySelector('button'));

  // ---------- helpers ----------
  function updateDisplay() {
    if (!timerDisplay) return;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        // session finished
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
    if (startBtn) startBtn.textContent = 'Start';
  }

  function setMode(mode) {
    currentMode = mode;
    modeButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    timerDuration = (durations[mode] || 25) * 60;
    timeLeft = timerDuration;
    updateDisplay();
  }

  // ---------- Event listeners ----------
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (timerInterval) {
        pauseTimer();
        startBtn.textContent = 'Start';
      } else {
        startTimer();
        startBtn.textContent = 'Pause';
      }
    });
  } else {
    console.warn('start button not found (id="start")');
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetTimer);
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }

  if (modeButtons.length) {
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setMode(btn.dataset.mode);
        // reset button text too
        if (startBtn) startBtn.textContent = 'Start';
      });
    });
  }

  // ---------- Settings modal open ----------
  if (settingsBtn && settingsModal && modalContent) {
    settingsBtn.addEventListener('click', () => {
      // populate inputs with current durations if inputs exist
      if (focusInput) focusInput.value = durations.focus;
      if (shortInput) shortInput.value = durations.short;
      if (longInput) longInput.value = durations.long;

      settingsModal.classList.toggle('hidden');
    });
  } else {
    // don't spam the console if the user intentionally doesn't have settings
    console.info('Settings UI not fully present: settingsBtn or settingsModal or modalContent missing.');
  }

  // ---------- Save handler (handles submit or click) ----------
  function saveSettings(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    // If inputs exist, read them; otherwise keep existing durations
    const newFocus = focusInput ? parseInt(focusInput.value, 10) : durations.focus;
    const newShort = shortInput ? parseInt(shortInput.value, 10) : durations.short;
    const newLong = longInput ? parseInt(longInput.value, 10) : durations.long;

    // basic sanitization: ensure positive integers
    durations.focus = Number.isFinite(newFocus) && newFocus >= 1 ? Math.round(newFocus) : durations.focus;
    durations.short = Number.isFinite(newShort) && newShort >= 1 ? Math.round(newShort) : durations.short;
    durations.long = Number.isFinite(newLong) && newLong >= 1 ? Math.round(newLong) : durations.long;

    // close modal and refresh current mode so timer updates immediately
    if (settingsModal) settingsModal.classList.add('hidden');
    setMode(currentMode);

    // set button label back to Start (in case user was mid-run)
    if (startBtn) startBtn.textContent = 'Start';
  }

  // If saveSettingsBtn exists attach click and force it to type="button" (prevents form submit)
  if (saveSettingsBtn) {
    try {
      saveSettingsBtn.setAttribute('type', 'button');
    } catch (err) { /* ignore if read-only */ }

    saveSettingsBtn.addEventListener('click', saveSettings);
  } else if (modalContent) {
    // fallback: if there is a <form> inside modal, listen for its submit
    const modalForm = modalContent.querySelector('form');
    if (modalForm) {
      modalForm.addEventListener('submit', saveSettings);
    } else {
      console.info('No explicit save button found inside modal; create one with id="saveSettings" or a form to handle submit.');
    }
  }

  // Close modal when clicking outside the modal-content
  if (settingsModal && modalContent) {
    settingsModal.addEventListener('click', (e) => {
      if (!modalContent.contains(e.target)) {
        settingsModal.classList.add('hidden');
      }
    });
  }

  // Initialize display & active mode
  setMode(currentMode);
  updateDisplay();
});