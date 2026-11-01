/**
 * Psychology 101 Interactive Study App - Upgraded Core Application Logic
 * Featuring:
 * 1. Spaced Repetition System (SRS) for Flashcards (localStorage persistence, ease ratings, intervals)
 * 2. Active Recall & Cloze Self-Testing Study Mode
 * 3. Speed-Match Vocabulary Tile Game (60s timer, combos, high score tracking)
 * 4. Interactive Cognitive Labs (Stroop Effect experiment, Digit-Span Working Memory test, Gestalt/Perception sandbox)
 * 5. Interactive SVG Brain Anatomy Map with functional & clinical lesion breakdowns
 * 6. 40-Question Comprehensive Mock Final Exam spanning all 8 curriculum modules
 * 7. Text-To-Speech (Web Speech API) Audio Mode ("Listen & Learn")
 * 8. Daily Study Streaks & Gamification Badges
 * 9. Movable / Draggable Study Notes Floating Widget with boundary collision detection
 * 10. 25-Min Minimalist Pomodoro Focus Timer with Web Audio API chime
 * 11. Dark / Light mode theme management respecting system preferences
 */

(function () {
  "use strict";

  // Application State
  const state = {
    currentModuleId: "intro-history",
    currentTab: "study", // "study" | "flashcards" | "quiz" | "case-study" | "resources"
    
    // Spaced Repetition Flashcard State
    flashcard: {
      index: 0,
      isFlipped: false,
      filter: "all", // "all" | "due" | "mastered"
      mode: "flip", // "flip" | "recall"
      shuffledCards: []
    },

    // Quiz state (keyed by module ID)
    quiz: {
      answers: {}, // { [questionId]: selectedIndex }
      submitted: false,
      score: 0
    },

    // Case Study state (keyed by case study ID)
    caseStudyAnswers: JSON.parse(localStorage.getItem("psych_casestudy_answers") || "{}"),
    caseStudyRevealed: {},

    // Spaced Repetition System storage
    // { [cardId]: { ease: 'hard'|'good'|'easy', reviewCount: 1, lastReviewed: ts, nextReviewDate: ts, intervalDays: 3 } }
    srsCards: JSON.parse(localStorage.getItem("psych_srs_state") || "{}"),

    // Guided 5-Step Learning Roadmap state per module
    // { [moduleId]: { guide: bool, video: bool, flashcards: bool, caseStudy: bool, quiz: bool } }
    moduleSteps: JSON.parse(localStorage.getItem("psych_module_steps") || "{}"),

    // User progress stored locally
    userProgress: {
      completedQuizzes: JSON.parse(localStorage.getItem("psych_completed_quizzes") || "{}"),
      readSections: JSON.parse(localStorage.getItem("psych_read_sections") || "[]")
    },

    // Pomodoro Timer State
    pomodoro: {
      mode: "focus", // "focus" (25m) | "break" (5m)
      durationFocus: 25 * 60,
      durationBreak: 5 * 60,
      remaining: 25 * 60,
      isRunning: false,
      timerId: null
    },

    // Speed Match Game State
    speedMatch: {
      active: false,
      score: 0,
      combo: 1,
      timer: 60,
      timerId: null,
      selected: null, // { id, type, pairId, text, element }
      matches: 0,
      tiles: []
    },

    // Cognitive Labs State
    stroop: {
      step: "intro", // "intro" | "test" | "results"
      trials: [],
      trialIndex: 0,
      results: [],
      startTime: 0
    },
    digitSpan: {
      step: "intro", // "intro" | "display" | "recall" | "results"
      length: 3,
      sequence: [],
      displayIndex: 0,
      attempts: 0,
      maxSpan: 0
    },
    currentLabTab: "stroop", // "stroop" | "digitspan" | "perception" | "brain"

    // Mock Final Exam State (40 Qs)
    mockExam: {
      active: false,
      answers: {},
      flagged: {},
      currentIndex: 0,
      remaining: 30 * 60,
      timerId: null,
      submitted: false,
      score: 0,
      questions: []
    },

    // Text to Speech
    audio: {
      speaking: false,
      activeBtn: null
    },

    searchQuery: "",
    isMobileMenuOpen: false
  };

  // Helper to fetch current module
  function getCurrentModule() {
    return PSYCH_DATA.modules.find(m => m.id === state.currentModuleId) || PSYCH_DATA.modules[0];
  }

  // Persist SRS State
  function persistSRS() {
    localStorage.setItem("psych_srs_state", JSON.stringify(state.srsCards));
    localStorage.setItem("psych_casestudy_answers", JSON.stringify(state.caseStudyAnswers));
    localStorage.setItem("psych_completed_quizzes", JSON.stringify(state.userProgress.completedQuizzes));
    localStorage.setItem("psych_module_steps", JSON.stringify(state.moduleSteps));
    updateStatsBadges();
  }

  // DOM Elements
  const DOM = {
    sidebarModules: document.getElementById("sidebar-modules"),
    mobileSidebarModules: document.getElementById("mobile-sidebar-modules"),
    mobileMenu: document.getElementById("mobile-menu"),
    mobileMenuBackdrop: document.getElementById("mobile-menu-backdrop"),
    btnOpenMenu: document.getElementById("btn-open-menu"),
    btnCloseMenu: document.getElementById("btn-close-menu"),
    moduleHeader: document.getElementById("module-header"),
    moduleTabs: document.getElementById("module-tabs"),
    tabContent: document.getElementById("tab-content"),
    searchInput: document.getElementById("search-input"),
    searchResults: document.getElementById("search-results"),
    totalMasteredBadge: document.getElementById("total-mastered-badge"),
    overallProgressFill: document.getElementById("overall-progress-fill"),
    overallProgressPct: document.getElementById("overall-progress-pct"),
    toastContainer: document.getElementById("toast-container"),

    // Theme Toggle
    btnThemeToggle: document.getElementById("btn-theme-toggle"),
    btnThemeToggleMobile: document.getElementById("btn-theme-toggle-mobile"),

    // Pomodoro Timer Elements
    pomoTimeDisplay: document.getElementById("pomo-time-display"),
    pomoModeBtn: document.getElementById("pomo-mode-btn"),
    pomoModeLabel: document.getElementById("pomo-mode-label"),
    pomoToggleBtn: document.getElementById("pomo-toggle-btn"),
    pomoResetBtn: document.getElementById("pomo-reset-btn"),
    pomoIconPlay: document.getElementById("pomo-icon-play"),
    pomoIconPause: document.getElementById("pomo-icon-pause"),
    pomoAudioTestBtn: document.getElementById("pomo-audio-test-btn"),

    // Movable Notes Scratchpad Elements
    floatingNotesContainer: document.getElementById("floating-notes-container"),
    notesDragHandle: document.getElementById("notes-drag-handle"),
    notesPillWrapper: document.getElementById("notes-pill-wrapper"),
    btnToggleScratchpad: document.getElementById("btn-toggle-scratchpad"),
    btnResetNotesPos: document.getElementById("btn-reset-notes-pos"),
    btnOpenNotesSidebar: document.getElementById("btn-open-notes-sidebar"),
    scratchpadPanel: document.getElementById("scratchpad-panel"),
    scratchpadTitle: document.getElementById("scratchpad-title"),
    scratchpadTextarea: document.getElementById("scratchpad-textarea"),
    scratchpadSaveStatus: document.getElementById("scratchpad-save-status"),
    scratchpadWordBadge: document.getElementById("scratchpad-word-badge"),
    scratchpadCharCount: document.getElementById("scratchpad-char-count"),
    btnCopyNotes: document.getElementById("btn-copy-notes"),
    btnExportNotes: document.getElementById("btn-export-notes"),
    btnClearNotes: document.getElementById("btn-clear-notes"),
    btnCloseScratchpad: document.getElementById("btn-close-scratchpad"),

    // Hub Quick Actions & Modals
    btnStreakBadge: document.getElementById("btn-streak-badge"),
    streakCounter: document.getElementById("streak-counter"),
    btnOpenLabs: document.getElementById("btn-open-labs"),
    btnOpenSpeedmatch: document.getElementById("btn-open-speedmatch"),
    btnOpenMockexam: document.getElementById("btn-open-mockexam"),
    sidebarBtnLabs: document.getElementById("sidebar-btn-labs"),
    sidebarBtnSpeedmatch: document.getElementById("sidebar-btn-speedmatch"),
    sidebarBtnMockexam: document.getElementById("sidebar-btn-mockexam"),
    mobileBtnLabs: document.getElementById("mobile-btn-labs"),
    mobileBtnSpeedmatch: document.getElementById("mobile-btn-speedmatch"),
    mobileBtnMockexam: document.getElementById("mobile-btn-mockexam"),

    // Modal Dialogs
    modalLabs: document.getElementById("modal-labs"),
    modalLabsClose: document.getElementById("modal-labs-close"),
    labTabContent: document.getElementById("lab-tab-content"),
    labTabStroop: document.getElementById("lab-tab-stroop"),
    labTabDigitspan: document.getElementById("lab-tab-digitspan"),
    labTabPerception: document.getElementById("lab-tab-perception"),
    labTabBrain: document.getElementById("lab-tab-brain"),

    modalSpeedmatch: document.getElementById("modal-speedmatch"),
    modalSpeedmatchClose: document.getElementById("modal-speedmatch-close"),
    speedmatchBody: document.getElementById("speedmatch-body"),

    modalMockexam: document.getElementById("modal-mockexam"),
    modalMockexamClose: document.getElementById("modal-mockexam-close"),
    mockexamBody: document.getElementById("mockexam-body"),

    modalStreaks: document.getElementById("modal-streaks"),
    modalStreaksClose: document.getElementById("modal-streaks-close"),
    streaksBody: document.getElementById("streaks-body"),

    // Guided Learning Path & Stepper Elements
    moduleStepper: document.getElementById("module-stepper"),
    sidebarNextUpContainer: document.getElementById("sidebar-next-up-container"),
    sidebarNextUpTitle: document.getElementById("sidebar-next-up-title"),
    sidebarNextUpDesc: document.getElementById("sidebar-next-up-desc"),
    sidebarBtnResume: document.getElementById("sidebar-btn-resume"),
    sidebarBtnResumeLabel: document.getElementById("sidebar-btn-resume-label"),
    mobileNextUpContainer: document.getElementById("mobile-next-up-container"),
    mobileNextUpTitle: document.getElementById("mobile-next-up-title"),
    mobileNextUpDesc: document.getElementById("mobile-next-up-desc"),
    mobileBtnResume: document.getElementById("mobile-btn-resume"),
    mobileBtnResumeLabel: document.getElementById("mobile-btn-resume-label"),
    btnOpenGuide: document.getElementById("btn-open-guide"),
    mobileBtnGuide: document.getElementById("mobile-btn-guide"),
    modalGuide: document.getElementById("modal-guide"),
    modalGuideClose: document.getElementById("modal-guide-close"),
    modalGuideAction: document.getElementById("modal-guide-action"),
    modalGuideActionLabel: document.getElementById("modal-guide-action-label")
  };

  // Initialize App
  function init() {
    initTheme();
    initPomodoro();
    initScratchpad();
    initMovableNotes();
    initStreaksAndAchievements();
    initHubModals();
    renderSidebar();
    resetFlashcardsForCurrentModule();
    renderCurrentView();
    setupEventListeners();
    updateStatsBadges();
    updateSidebarNextUpCard();
  }

  // Toast Notification System
  function showToast(message, type = "info") {
    if (!DOM.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast-animate pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl shadow-xl text-xs sm:text-sm font-semibold border backdrop-blur-md transition-all ${
      type === "success" 
        ? "bg-emerald-900/95 text-emerald-100 border-emerald-700/80" 
        : type === "warning"
          ? "bg-amber-900/95 text-amber-100 border-amber-700/80"
          : "bg-indigo-950/95 text-indigo-100 border-indigo-700/80"
    }`;

    let icon = `
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;
    if (type === "success") {
      icon = `
        <svg class="w-4 h-4 flex-shrink-0 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
    } else if (type === "warning") {
      icon = `
        <svg class="w-4 h-4 flex-shrink-0 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      `;
    }

    toast.innerHTML = `
      ${icon}
      <span class="flex-1 leading-snug">${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // 1. Dark / Light Theme Manager
  function initTheme() {
    const handleToggle = () => {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("psych_theme", "light");
        showToast("Switched to Light Mode ☀️");
      } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("psych_theme", "dark");
        showToast("Switched to Dark Mode 🌙");
      }
    };

    DOM.btnThemeToggle?.addEventListener("click", handleToggle);
    DOM.btnThemeToggleMobile?.addEventListener("click", handleToggle);
  }

  // Web Audio Chime Synthesizer
  function playSoftChime(frequency = 587.33, duration = 1.0) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.98, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // 2. Pomodoro Focus Timer
  function initPomodoro() {
    renderPomoDisplay();

    DOM.pomoToggleBtn?.addEventListener("click", togglePomodoro);
    DOM.pomoResetBtn?.addEventListener("click", resetPomodoro);
    DOM.pomoModeBtn?.addEventListener("click", switchPomodoroMode);
    DOM.pomoAudioTestBtn?.addEventListener("click", () => {
      playSoftChime(528, 1.2);
      showToast("Chime preview: Soft 528Hz Solfeggio bell 🔔");
    });
  }

  function renderPomoDisplay() {
    const minutes = Math.floor(state.pomodoro.remaining / 60);
    const seconds = state.pomodoro.remaining % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (DOM.pomoTimeDisplay) {
      DOM.pomoTimeDisplay.textContent = formatted;
    }
    if (DOM.pomoModeLabel) {
      DOM.pomoModeLabel.textContent = state.pomodoro.mode === "focus" ? "Focus" : "Break";
    }

    if (DOM.pomoIconPlay && DOM.pomoIconPause) {
      if (state.pomodoro.isRunning) {
        DOM.pomoIconPlay.classList.add("hidden");
        DOM.pomoIconPause.classList.remove("hidden");
      } else {
        DOM.pomoIconPlay.classList.remove("hidden");
        DOM.pomoIconPause.classList.add("hidden");
      }
    }
  }

  function togglePomodoro() {
    if (state.pomodoro.isRunning) {
      pausePomodoro();
    } else {
      startPomodoro();
    }
  }

  function startPomodoro() {
    state.pomodoro.isRunning = true;
    renderPomoDisplay();
    state.pomodoro.timerId = setInterval(() => {
      if (state.pomodoro.remaining > 0) {
        state.pomodoro.remaining--;
        renderPomoDisplay();
      } else {
        pausePomodoro();
        playSoftChime(660, 2.0);

        if (state.pomodoro.mode === "focus") {
          showToast("🎉 25-minute focus sprint complete! Enjoy a relaxing 5-minute break.", "success");
          unlockAchievement("focus_master");
          state.pomodoro.mode = "break";
          state.pomodoro.remaining = state.pomodoro.durationBreak;
        } else {
          showToast("⚡ Break finished! Ready for your next deep study session?", "info");
          state.pomodoro.mode = "focus";
          state.pomodoro.remaining = state.pomodoro.durationFocus;
        }
        renderPomoDisplay();
      }
    }, 1000);
  }

  function pausePomodoro() {
    state.pomodoro.isRunning = false;
    if (state.pomodoro.timerId) {
      clearInterval(state.pomodoro.timerId);
      state.pomodoro.timerId = null;
    }
    renderPomoDisplay();
  }

  function resetPomodoro() {
    pausePomodoro();
    state.pomodoro.remaining = state.pomodoro.mode === "focus" 
      ? state.pomodoro.durationFocus 
      : state.pomodoro.durationBreak;
    renderPomoDisplay();
    showToast("Timer reset to " + (state.pomodoro.mode === "focus" ? "25:00" : "05:00"));
  }

  function switchPomodoroMode() {
    pausePomodoro();
    state.pomodoro.mode = state.pomodoro.mode === "focus" ? "break" : "focus";
    state.pomodoro.remaining = state.pomodoro.mode === "focus" 
      ? state.pomodoro.durationFocus 
      : state.pomodoro.durationBreak;
    renderPomoDisplay();
    showToast(`Switched to ${state.pomodoro.mode === "focus" ? "25-min Focus Sprint" : "5-min Short Break"}`);
  }

  // 3. Persistent Collapsible Notes Scratchpad
  function initScratchpad() {
    loadScratchpadForModule(state.currentModuleId);

    // Toggle button
    DOM.btnToggleScratchpad?.addEventListener("click", () => {
      if (DOM.notesPillWrapper && DOM.notesPillWrapper._suppressNextClick) return;
      const isCollapsed = DOM.scratchpadPanel?.classList.contains("collapsed");
      DOM.scratchpadPanel?.classList.toggle("collapsed", !isCollapsed);
      if (isCollapsed) {
        DOM.scratchpadTextarea?.focus();
      }
    });

    DOM.btnOpenNotesSidebar?.addEventListener("click", () => {
      DOM.scratchpadPanel?.classList.remove("collapsed");
      DOM.scratchpadTextarea?.focus();
    });

    DOM.btnCloseScratchpad?.addEventListener("click", () => {
      DOM.scratchpadPanel?.classList.add("collapsed");
    });

    // Auto-save on input
    DOM.scratchpadTextarea?.addEventListener("input", (e) => {
      const text = e.target.value;
      saveScratchpad(text);
      updateScratchpadStats(text);
      if (text.trim().length > 20) {
        unlockAchievement("notes_scribe");
      }
    });

    // Copy Notes
    DOM.btnCopyNotes?.addEventListener("click", async () => {
      const text = DOM.scratchpadTextarea?.value || "";
      if (!text.trim()) {
        showToast("Scratchpad is empty.", "warning");
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        showToast("Notes copied to clipboard! 📋", "success");
      } catch (err) {
        showToast("Failed to copy automatically.", "warning");
      }
    });

    // Export Notes as .txt
    DOM.btnExportNotes?.addEventListener("click", () => {
      const text = DOM.scratchpadTextarea?.value || "";
      if (!text.trim()) {
        showToast("No notes to export.", "warning");
        return;
      }
      const mod = getCurrentModule();
      const blob = new Blob([`Psychology 101 Notes - ${mod.title}\n${"=".repeat(50)}\n\n${text}`], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `psych101_notes_${mod.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported notes for Module ${mod.number} 💾`, "success");
    });

    // Clear Notes
    DOM.btnClearNotes?.addEventListener("click", () => {
      if (!DOM.scratchpadTextarea?.value.trim()) return;
      if (confirm("Clear all notes for this module?")) {
        DOM.scratchpadTextarea.value = "";
        saveScratchpad("");
        updateScratchpadStats("");
        showToast("Module notes cleared.", "info");
      }
    });
  }

  function loadScratchpadForModule(moduleId) {
    const saved = localStorage.getItem(`psych_notes_${moduleId}`) || "";
    if (DOM.scratchpadTextarea) {
      DOM.scratchpadTextarea.value = saved;
    }
    const mod = PSYCH_DATA.modules.find(m => m.id === moduleId) || PSYCH_DATA.modules[0];
    if (DOM.scratchpadTitle) {
      DOM.scratchpadTitle.textContent = `Notes: Mod ${mod.number} (${mod.title.split(":")[0]})`;
    }
    updateScratchpadStats(saved);
  }

  function saveScratchpad(text) {
    localStorage.setItem(`psych_notes_${state.currentModuleId}`, text);
    if (DOM.scratchpadSaveStatus) {
      DOM.scratchpadSaveStatus.textContent = "Saved";
      setTimeout(() => {
        if (DOM.scratchpadSaveStatus) DOM.scratchpadSaveStatus.textContent = "Auto-saved to localStorage";
      }, 1500);
    }
  }

  function updateScratchpadStats(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    if (DOM.scratchpadWordBadge) {
      DOM.scratchpadWordBadge.textContent = `${words}w`;
    }
    if (DOM.scratchpadCharCount) {
      DOM.scratchpadCharCount.textContent = `${words} words • ${chars} chars`;
    }
  }

  // 4. Movable Draggable Floating Notes Widget
  function initMovableNotes() {
    const container = DOM.floatingNotesContainer;
    const dragHandle = DOM.notesDragHandle;
    const wrapper = DOM.notesPillWrapper;
    const resetBtn = DOM.btnResetNotesPos;
    if (!container || !wrapper) return;

    // Restore saved coordinates
    const savedPos = localStorage.getItem("psych_notes_btn_pos");
    if (savedPos) {
      try {
        const { left, top } = JSON.parse(savedPos);
        const maxLeft = Math.max(10, window.innerWidth - 180);
        const maxTop = Math.max(10, window.innerHeight - 60);
        const clampedLeft = Math.min(Math.max(10, left), maxLeft);
        const clampedTop = Math.min(Math.max(10, top), maxTop);
        container.style.left = `${clampedLeft}px`;
        container.style.top = `${clampedTop}px`;
        container.style.bottom = "auto";
        container.style.right = "auto";
      } catch (e) {}
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let hasMoved = false;

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      const rect = container.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      hasMoved = false;
      isDragging = true;

      try {
        (dragHandle || wrapper).setPointerCapture(e.pointerId);
      } catch (err) {}
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!hasMoved && Math.hypot(dx, dy) > 5) {
        hasMoved = true;
        container.classList.add("is-dragging");
      }

      if (hasMoved) {
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const pad = 8;
        const maxLeft = window.innerWidth - (container.offsetWidth || 160) - pad;
        const maxTop = window.innerHeight - 50 - pad;

        newLeft = Math.min(Math.max(pad, newLeft), maxLeft);
        newTop = Math.min(Math.max(pad, newTop), maxTop);

        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;
        container.style.bottom = "auto";
        container.style.right = "auto";
      }
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove("is-dragging");

      try {
        (dragHandle || wrapper).releasePointerCapture(e.pointerId);
      } catch (err) {}

      if (hasMoved) {
        const rect = container.getBoundingClientRect();
        localStorage.setItem("psych_notes_btn_pos", JSON.stringify({ left: rect.left, top: rect.top }));
        wrapper._suppressNextClick = true;
        setTimeout(() => { wrapper._suppressNextClick = false; }, 200);
      }
    };

    dragHandle?.addEventListener("pointerdown", onPointerDown);
    wrapper?.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    // Reset Position
    resetBtn?.addEventListener("click", () => {
      container.style.left = "auto";
      container.style.top = "auto";
      container.style.bottom = "20px";
      container.style.right = "20px";
      localStorage.removeItem("psych_notes_btn_pos");
      showToast("Notes dock position reset to bottom-right! 📌");
    });
  }

  // 5. Daily Study Streaks & Gamification Badges
  const BADGES_META = [
    { id: "curious_mind", title: "Curious Mind", desc: "Read your first module topic", icon: "🌱" },
    { id: "srs_scholar", title: "SRS Scholar", desc: "Mastered 8+ flashcards", icon: "🎴" },
    { id: "stroop_master", title: "Stroop Master", desc: "Completed the Stroop Cognitive Lab", icon: "⚡" },
    { id: "memory_prodigy", title: "Memory Prodigy", desc: "Achieved Digit-Span ≥ 7 items", icon: "🗃️" },
    { id: "brain_explorer", title: "Neuro-Pioneer", desc: "Explored all lobes in the Brain Map", icon: "🧠" },
    { id: "speed_match_ace", title: "Speed Demon", desc: "Matched all pairs in Speed Match", icon: "🎮" },
    { id: "exam_graduate", title: "Psych Graduate", desc: "Scored 70%+ on 40-Q Mock Exam", icon: "📜" },
    { id: "focus_master", title: "Focus Master", desc: "Finished a 25-min Pomodoro sprint", icon: "⏳" },
    { id: "notes_scribe", title: "Active Scribe", desc: "Wrote study notes in Scratchpad", icon: "✍️" }
  ];

  function initStreaksAndAchievements() {
    const streakKey = "psych_streak_data";
    const raw = localStorage.getItem(streakKey);
    const todayStr = new Date().toISOString().slice(0, 10);

    let data = { currentStreak: 1, lastStudyDate: todayStr, totalDaysStudied: 1 };
    if (raw) {
      try {
        data = JSON.parse(raw);
        if (data.lastStudyDate !== todayStr) {
          const lastDate = new Date(data.lastStudyDate);
          const now = new Date(todayStr);
          const diffDays = Math.round((now - lastDate) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            data.currentStreak = (data.currentStreak || 1) + 1;
          } else if (diffDays > 1) {
            data.currentStreak = 1;
          }
          data.lastStudyDate = todayStr;
          data.totalDaysStudied = (data.totalDaysStudied || 1) + 1;
        }
      } catch (e) {
        data = { currentStreak: 1, lastStudyDate: todayStr, totalDaysStudied: 1 };
      }
    }
    localStorage.setItem(streakKey, JSON.stringify(data));

    if (DOM.streakCounter) {
      DOM.streakCounter.textContent = `${data.currentStreak} Day${data.currentStreak > 1 ? 's' : ''} Streak`;
    }
  }

  function unlockAchievement(badgeId) {
    const unlocked = JSON.parse(localStorage.getItem("psych_unlocked_badges") || "[]");
    if (!unlocked.includes(badgeId)) {
      unlocked.push(badgeId);
      localStorage.setItem("psych_unlocked_badges", JSON.stringify(unlocked));
      const b = BADGES_META.find(x => x.id === badgeId);
      if (b) {
        playSoftChime(880, 1.2);
        showToast(`🏆 Achievement Unlocked: ${b.icon} ${b.title}!`, "success");
      }
    }
  }

  function renderStreaksModal() {
    if (!DOM.streaksBody) return;
    const streakData = JSON.parse(localStorage.getItem("psych_streak_data") || '{"currentStreak":1,"totalDaysStudied":1}');
    const unlocked = JSON.parse(localStorage.getItem("psych_unlocked_badges") || "[]");

    DOM.streaksBody.innerHTML = `
      <div class="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 animate-pulse">🔥</div>
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Current Study Streak</h4>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-0.5">${streakData.currentStreak || 1} Day Streak</div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Total days studied: ${streakData.totalDaysStudied || 1} days</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-full">Consistent Learner</span>
        </div>
      </div>

      <div>
        <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between">
          <span>Curriculum Badges & Milestones</span>
          <span>${unlocked.length} / ${BADGES_META.length} Unlocked</span>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${BADGES_META.map(b => {
            const isUnlocked = unlocked.includes(b.id);
            return `
              <div class="p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                isUnlocked 
                  ? 'bg-white dark:bg-slate-800/80 border-indigo-200 dark:border-indigo-800/80 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/60 opacity-60'
              }">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  isUnlocked ? 'bg-indigo-100 dark:bg-indigo-950/80' : 'bg-slate-200 dark:bg-slate-800'
                }">
                  ${isUnlocked ? b.icon : '🔒'}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">${b.title}</h5>
                    ${isUnlocked ? '<span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Unlocked</span>' : ''}
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${b.desc}</p>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  // 6. Text-To-Speech (Web Speech API)
  function speakText(text, btnElement) {
    if (!("speechSynthesis" in window)) {
      showToast("Speech synthesis is not supported on this browser.", "warning");
      return;
    }

    if (state.audio.speaking) {
      window.speechSynthesis.cancel();
      state.audio.speaking = false;
      if (state.audio.activeBtn) {
        state.audio.activeBtn.classList.remove("audio-pulse", "text-indigo-600", "dark:text-indigo-400");
        state.audio.activeBtn.title = "Read aloud";
      }
      if (state.audio.activeBtn === btnElement) {
        state.audio.activeBtn = null;
        return;
      }
    }

    const clean = text.replace(/[*#_`>-]/g, " ").replace(/\s+/g, " ");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    state.audio.speaking = true;
    state.audio.activeBtn = btnElement;
    if (btnElement) {
      btnElement.classList.add("audio-pulse", "text-indigo-600", "dark:text-indigo-400");
      btnElement.title = "Click to stop reading";
    }

    utterance.onend = () => {
      state.audio.speaking = false;
      if (state.audio.activeBtn) {
        state.audio.activeBtn.classList.remove("audio-pulse", "text-indigo-600", "dark:text-indigo-400");
        state.audio.activeBtn.title = "Read aloud";
        state.audio.activeBtn = null;
      }
    };
    utterance.onerror = utterance.onend;

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    state.audio.speaking = false;
    if (state.audio.activeBtn) {
      state.audio.activeBtn.classList.remove("audio-pulse", "text-indigo-600", "dark:text-indigo-400");
      state.audio.activeBtn = null;
    }
  }

  // 7. Speed Match Tile Game
  function openSpeedMatch(moduleFilter = null) {
    DOM.modalSpeedmatch?.classList.remove("hidden");
    startSpeedMatchRound(moduleFilter);
  }

  function startSpeedMatchRound(moduleFilter) {
    if (state.speedMatch.timerId) clearInterval(state.speedMatch.timerId);

    const mod = moduleFilter ? (PSYCH_DATA.modules.find(m => m.id === moduleFilter) || getCurrentModule()) : getCurrentModule();
    const flashcardsPool = [...mod.flashcards];

    // Pick 6 cards
    const shuffledCards = [...flashcardsPool].sort(() => 0.5 - Math.random()).slice(0, 6);

    const tiles = [];
    shuffledCards.forEach((c, idx) => {
      tiles.push({
        id: `term-${idx}`,
        type: "term",
        pairId: c.id,
        text: c.term
      });
      tiles.push({
        id: `def-${idx}`,
        type: "def",
        pairId: c.id,
        text: c.definition.length > 90 ? c.definition.slice(0, 85) + "..." : c.definition
      });
    });

    tiles.sort(() => 0.5 - Math.random());

    state.speedMatch = {
      active: true,
      score: 0,
      combo: 1,
      timer: 60,
      timerId: null,
      selected: null,
      matches: 0,
      tiles: tiles,
      currentModTitle: mod.title
    };

    renderSpeedMatchUI();

    state.speedMatch.timerId = setInterval(() => {
      if (state.speedMatch.timer > 0) {
        state.speedMatch.timer--;
        const timerEl = document.getElementById("speedmatch-timer");
        if (timerEl) timerEl.textContent = `${state.speedMatch.timer}s`;
      } else {
        clearInterval(state.speedMatch.timerId);
        state.speedMatch.active = false;
        renderSpeedMatchGameOver(false);
      }
    }, 1000);
  }

  function renderSpeedMatchUI() {
    if (!DOM.speedmatchBody) return;
    const bestScore = localStorage.getItem("psych_speedmatch_best") || 0;

    DOM.speedmatchBody.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">${state.speedMatch.currentModTitle.split(":")[0]}</span>
            <span class="text-xs text-slate-400">&bull;</span>
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Matches: <span id="sm-matches" class="font-bold text-slate-900 dark:text-white">${state.speedMatch.matches}/6</span></span>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-xs font-bold text-amber-600 dark:text-amber-400">
              Combo: <span id="sm-combo" class="text-sm font-extrabold text-amber-500">x${state.speedMatch.combo}</span>
            </div>
            <div class="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Score: <span id="sm-score" class="text-sm font-extrabold">${state.speedMatch.score}</span>
            </div>
            <div id="speedmatch-timer" class="font-timer text-sm font-extrabold px-3 py-1 bg-purple-600 text-white rounded-xl shadow-xs">
              ${state.speedMatch.timer}s
            </div>
          </div>
        </div>

        <div id="sm-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          ${state.speedMatch.tiles.map((t, i) => `
            <button 
              type="button" 
              data-tile-idx="${i}" 
              class="speedmatch-tile min-h-[90px] p-3 text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-500 flex flex-col justify-between shadow-xs transition-all cursor-pointer ${
                t.type === 'term' ? 'font-bold text-xs sm:text-sm text-slate-900 dark:text-white' : 'text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug'
              }">
              <div class="flex items-center justify-between w-full mb-1">
                <span class="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  t.type === 'term' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                }">${t.type === 'term' ? 'Term' : 'Definition'}</span>
              </div>
              <p class="select-none line-clamp-3">${t.text}</p>
            </button>
          `).join("")}
        </div>

        <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Click a term, then click its corresponding definition!</span>
          <span>High Score: <strong class="text-slate-700 dark:text-slate-300">${bestScore}</strong></span>
        </div>
      </div>
    `;

    const tileBtns = DOM.speedmatchBody.querySelectorAll(".speedmatch-tile");
    tileBtns.forEach((btn, idx) => {
      btn.addEventListener("click", () => handleTileClick(idx, btn));
    });
  }

  function handleTileClick(tileIndex, btnElement) {
    if (!state.speedMatch.active) return;
    const tile = state.speedMatch.tiles[tileIndex];
    if (tile.matched) return;

    if (state.speedMatch.selected && state.speedMatch.selected.index === tileIndex) {
      btnElement.classList.remove("ring-2", "ring-purple-600", "bg-purple-50", "dark:bg-purple-950/60");
      state.speedMatch.selected = null;
      return;
    }

    if (!state.speedMatch.selected) {
      state.speedMatch.selected = { ...tile, index: tileIndex, element: btnElement };
      btnElement.classList.add("ring-2", "ring-purple-600", "bg-purple-50", "dark:bg-purple-950/60");
      return;
    }

    const prev = state.speedMatch.selected;

    if (prev.type === tile.type) {
      prev.element.classList.remove("ring-2", "ring-purple-600", "bg-purple-50", "dark:bg-purple-950/60");
      state.speedMatch.selected = { ...tile, index: tileIndex, element: btnElement };
      btnElement.classList.add("ring-2", "ring-purple-600", "bg-purple-50", "dark:bg-purple-950/60");
      return;
    }

    if (prev.pairId === tile.pairId) {
      playSoftChime(880, 0.6);
      tile.matched = true;
      state.speedMatch.tiles[prev.index].matched = true;

      prev.element.classList.remove("ring-2", "ring-purple-600", "bg-purple-50", "dark:bg-purple-950/60");
      prev.element.classList.add("tile-matched");
      btnElement.classList.add("tile-matched");

      state.speedMatch.matches++;
      state.speedMatch.score += 100 * state.speedMatch.combo;
      state.speedMatch.combo++;

      const smMatches = document.getElementById("sm-matches");
      const smScore = document.getElementById("sm-score");
      const smCombo = document.getElementById("sm-combo");

      if (smMatches) smMatches.textContent = `${state.speedMatch.matches}/6`;
      if (smScore) smScore.textContent = state.speedMatch.score;
      if (smCombo) smCombo.textContent = `x${state.speedMatch.combo}`;

      state.speedMatch.selected = null;

      if (state.speedMatch.matches === 6) {
        clearInterval(state.speedMatch.timerId);
        state.speedMatch.active = false;
        unlockAchievement("speed_match_ace");
        setTimeout(() => renderSpeedMatchGameOver(true), 600);
      }
    } else {
      playSoftChime(220, 0.4);
      prev.element.classList.add("tile-shake");
      btnElement.classList.add("tile-shake");
      state.speedMatch.combo = 1;
      const smCombo = document.getElementById("sm-combo");
      if (smCombo) smCombo.textContent = `x1`;

      setTimeout(() => {
        prev.element.classList.remove("ring-2", "ring-purple-600", "bg-purple-50", "dark:bg-purple-950/60", "tile-shake");
        btnElement.classList.remove("tile-shake");
        state.speedMatch.selected = null;
      }, 450);
    }
  }

  function renderSpeedMatchGameOver(won) {
    if (!DOM.speedmatchBody) return;
    const timeTaken = 60 - state.speedMatch.timer;
    const finalScore = state.speedMatch.score + (won ? state.speedMatch.timer * 10 : 0);
    const prevBest = parseInt(localStorage.getItem("psych_speedmatch_best") || "0", 10);
    if (finalScore > prevBest) {
      localStorage.setItem("psych_speedmatch_best", finalScore);
    }

    DOM.speedmatchBody.innerHTML = `
      <div class="py-10 text-center max-w-md mx-auto space-y-5">
        <div class="w-16 h-16 mx-auto rounded-3xl ${won ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950 text-rose-600'} flex items-center justify-center text-3xl shadow-lg">
          ${won ? '🎉' : '⌛'}
        </div>
        <div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white">${won ? 'Board Cleared!' : 'Time Ran Out!'}</h3>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">${won ? `All 6 concept pairs matched in ${timeTaken} seconds.` : 'Good effort! Challenge yourself to beat the timer.'}</p>
        </div>

        <div class="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-left">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Score</span>
            <div class="text-xl font-extrabold text-purple-600 dark:text-purple-400">${finalScore} pts</div>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">All-Time Best</span>
            <div class="text-xl font-extrabold text-slate-800 dark:text-white">${Math.max(finalScore, prevBest)} pts</div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button id="sm-btn-replay" class="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer">
            Play Next Round 🔁
          </button>
          <button id="sm-btn-close" class="px-5 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-colors cursor-pointer">
            Close
          </button>
        </div>
      </div>
    `;

    document.getElementById("sm-btn-replay")?.addEventListener("click", () => startSpeedMatchRound());
    document.getElementById("sm-btn-close")?.addEventListener("click", () => DOM.modalSpeedmatch?.classList.add("hidden"));
  }

  // 8. Interactive Cognitive Psychology Labs
  function initCognitiveLabs() {
    const setLabTab = (tab) => {
      state.currentLabTab = tab;
      [DOM.labTabStroop, DOM.labTabDigitspan, DOM.labTabPerception, DOM.labTabBrain].forEach(b => {
        b?.classList.remove("active", "border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "font-bold");
        b?.classList.add("border-transparent", "text-slate-500", "dark:text-slate-400", "font-medium");
      });

      if (tab === "stroop") {
        DOM.labTabStroop?.classList.add("active", "border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "font-bold");
        renderStroopLab();
      } else if (tab === "digitspan") {
        DOM.labTabDigitspan?.classList.add("active", "border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "font-bold");
        renderDigitSpanLab();
      } else if (tab === "perception") {
        DOM.labTabPerception?.classList.add("active", "border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "font-bold");
        renderPerceptionLab();
      } else if (tab === "brain") {
        DOM.labTabBrain?.classList.add("active", "border-indigo-600", "text-indigo-600", "dark:text-indigo-400", "font-bold");
        renderBrainMapLab();
      }
    };

    DOM.labTabStroop?.addEventListener("click", () => setLabTab("stroop"));
    DOM.labTabDigitspan?.addEventListener("click", () => setLabTab("digitspan"));
    DOM.labTabPerception?.addEventListener("click", () => setLabTab("perception"));
    DOM.labTabBrain?.addEventListener("click", () => setLabTab("brain"));
  }

  function openCognitiveLabs(tab = "stroop") {
    DOM.modalLabs?.classList.remove("hidden");
    const tabBtn = tab === "digitspan" ? DOM.labTabDigitspan : tab === "perception" ? DOM.labTabPerception : tab === "brain" ? DOM.labTabBrain : DOM.labTabStroop;
    tabBtn?.click();
  }

  // Lab A: Stroop Effect
  const STROOP_COLORS = [
    { name: "RED", hex: "#ef4444" },
    { name: "BLUE", hex: "#3b82f6" },
    { name: "GREEN", hex: "#10b981" },
    { name: "YELLOW", hex: "#eab308" }
  ];

  function renderStroopLab() {
    if (!DOM.labTabContent) return;
    if (state.stroop.step === "intro") {
      DOM.labTabContent.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-5">
          <div class="bg-indigo-50 dark:bg-indigo-950/60 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-4">
            <span class="text-3xl">⚡</span>
            <div>
              <h4 class="font-extrabold text-indigo-950 dark:text-indigo-200 text-base">The Stroop Effect Experiment (1935)</h4>
              <p class="text-xs sm:text-sm text-indigo-900/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
                Demonstrated by John Ridley Stroop, this experiment tests cognitive interference and selective attention. When the semantic meaning of a word differs from the color of the ink (e.g., the word "BLUE" printed in red ink), your brain suffers a processing delay because reading is an automated task that must be inhibited by your prefrontal cortex.
              </p>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500">How to Play:</h5>
            <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              You will be presented with 10 words. <strong>Name the INK COLOR</strong> of the word as quickly and accurately as possible—ignore what the word actually spells!
            </p>
            <div class="flex items-center gap-2 pt-2">
              <span class="text-xs font-extrabold px-2 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-600">RED</span>
              <span class="text-xs font-extrabold px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-600">BLUE</span>
              <span class="text-xs font-extrabold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600">GREEN</span>
              <span class="text-xs font-extrabold px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-600">YELLOW</span>
            </div>
          </div>

          <button id="btn-start-stroop" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-sm transition-all cursor-pointer">
            Begin Stroop Test (10 Trials) 🚀
          </button>
        </div>
      `;

      document.getElementById("btn-start-stroop")?.addEventListener("click", startStroopTest);
    } else if (state.stroop.step === "test") {
      renderStroopTrial();
    } else if (state.stroop.step === "results") {
      renderStroopResults();
    }
  }

  function startStroopTest() {
    const trials = [];
    for (let i = 0; i < 5; i++) {
      const c = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
      trials.push({ word: c.name, colorHex: c.hex, correctName: c.name, type: "congruent" });
    }
    for (let i = 0; i < 5; i++) {
      const cWord = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)];
      const diffColors = STROOP_COLORS.filter(x => x.name !== cWord.name);
      const cColor = diffColors[Math.floor(Math.random() * diffColors.length)];
      trials.push({ word: cWord.name, colorHex: cColor.hex, correctName: cColor.name, type: "incongruent" });
    }
    trials.sort(() => 0.5 - Math.random());

    state.stroop = {
      step: "test",
      trials: trials,
      trialIndex: 0,
      results: [],
      startTime: 0
    };

    renderStroopTrial();
  }

  function renderStroopTrial() {
    if (state.stroop.trialIndex >= state.stroop.trials.length) {
      state.stroop.step = "results";
      renderStroopResults();
      return;
    }

    const trial = state.stroop.trials[state.stroop.trialIndex];
    state.stroop.startTime = performance.now();

    DOM.labTabContent.innerHTML = `
      <div class="max-w-lg mx-auto py-6 text-center space-y-8">
        <div class="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>Trial ${state.stroop.trialIndex + 1} of 10</span>
          <span>Target: INK COLOR</span>
        </div>

        <div class="py-12 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
          <span style="color: ${trial.colorHex};" class="text-5xl sm:text-6xl font-black tracking-widest select-none drop-shadow">
            ${trial.word}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          ${STROOP_COLORS.map(c => `
            <button 
              type="button" 
              data-color="${c.name}" 
              class="stroop-btn py-4 px-3 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-sm hover:scale-102 active:scale-95 transition-all cursor-pointer" 
              style="background-color: ${c.hex};">
              ${c.name}
            </button>
          `).join("")}
        </div>
      </div>
    `;

    DOM.labTabContent.querySelectorAll(".stroop-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const chosen = btn.getAttribute("data-color");
        const elapsed = performance.now() - state.stroop.startTime;
        const correct = chosen === trial.correctName;

        state.stroop.results.push({
          type: trial.type,
          correct: correct,
          rt: Math.round(elapsed)
        });

        state.stroop.trialIndex++;
        renderStroopTrial();
      });
    });
  }

  function renderStroopResults() {
    unlockAchievement("stroop_master");
    const cong = state.stroop.results.filter(r => r.type === "congruent" && r.correct);
    const incong = state.stroop.results.filter(r => r.type === "incongruent" && r.correct);

    const avgCong = cong.length ? Math.round(cong.reduce((a, b) => a + b.rt, 0) / cong.length) : 600;
    const avgIncong = incong.length ? Math.round(incong.reduce((a, b) => a + b.rt, 0) / incong.length) : 780;
    const interference = avgIncong - avgCong;

    DOM.labTabContent.innerHTML = `
      <div class="max-w-xl mx-auto space-y-6">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 mx-auto rounded-3xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
            📊
          </div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Your Stroop Effect Report</h3>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Reaction time breakdown and cognitive interference index</p>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Congruent RT</span>
            <div class="text-xl font-black text-emerald-950 dark:text-emerald-200 mt-1">${avgCong} ms</div>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400">Matching color</span>
          </div>

          <div class="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <span class="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Incongruent RT</span>
            <div class="text-xl font-black text-rose-950 dark:text-rose-200 mt-1">${avgIncong} ms</div>
            <span class="text-[10px] text-rose-600 dark:text-rose-400">Conflicting color</span>
          </div>

          <div class="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
            <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Interference</span>
            <div class="text-xl font-black text-indigo-950 dark:text-indigo-200 mt-1">${interference >= 0 ? `+${interference}` : interference} ms</div>
            <span class="text-[10px] text-indigo-600 dark:text-indigo-400">Processing delay</span>
          </div>
        </div>

        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
          <h4 class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Neuropsychological Mechanism:</h4>
          <p class="leading-relaxed">
            Your brain experienced a <strong>${Math.abs(interference)} ms</strong> ${interference >= 0 ? 'interference delay' : 'response discrepancy'}. When conflicting visual signals enter your visual cortex (V1), reading occurs automatically through your left occipitotemporal reading circuit. Your <strong>Anterior Cingulate Cortex (ACC)</strong> and <strong>Dorsolateral Prefrontal Cortex (DLPFC)</strong> must actively intervene to inhibit that automated linguistic impulse and isolate the sensory ink wavelength.
          </p>
        </div>

        <button id="btn-replay-stroop" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all cursor-pointer">
          Retake Stroop Test 🔁
        </button>
      </div>
    `;

    document.getElementById("btn-replay-stroop")?.addEventListener("click", () => {
      state.stroop.step = "intro";
      renderStroopLab();
    });
  }

  // Lab B: Working Memory Digit-Span Lab
  function renderDigitSpanLab() {
    if (!DOM.labTabContent) return;
    if (state.digitSpan.step === "intro") {
      DOM.labTabContent.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-5">
          <div class="bg-indigo-50 dark:bg-indigo-950/60 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-4">
            <span class="text-3xl">🗃️</span>
            <div>
              <h4 class="font-extrabold text-indigo-950 dark:text-indigo-200 text-base">Working Memory Capacity: Miller's Law (1956)</h4>
              <p class="text-xs sm:text-sm text-indigo-900/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
                In 1956, Harvard cognitive psychologist George A. Miller published <em>"The Magical Number Seven, Plus or Minus Two"</em>, establishing that conscious immediate working memory capacity is strictly bounded to roughly 7 ± 2 items unless chunking strategies are deployed.
              </p>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500">How this lab tests your capacity:</h5>
            <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Digits will flash on screen one by one for 900 milliseconds each. After the sequence ends, type the numbers in exact chronological order. Sequence length begins at 3 digits and increases with every correct recall!
            </p>
          </div>

          <button id="btn-start-digitspan" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-sm transition-all cursor-pointer">
            Begin Digit-Span Test 🔢
          </button>
        </div>
      `;

      document.getElementById("btn-start-digitspan")?.addEventListener("click", startDigitSpan);
    } else if (state.digitSpan.step === "display") {
      // Handled by runDigitSpanSequence
    } else if (state.digitSpan.step === "recall") {
      renderDigitSpanRecall();
    } else if (state.digitSpan.step === "results") {
      renderDigitSpanResults();
    }
  }

  function startDigitSpan() {
    state.digitSpan = {
      step: "display",
      length: 3,
      sequence: [],
      displayIndex: 0,
      attempts: 0,
      maxSpan: 0
    };
    runDigitSpanSequence();
  }

  function runDigitSpanSequence() {
    const seq = [];
    for (let i = 0; i < state.digitSpan.length; i++) {
      seq.push(Math.floor(Math.random() * 10));
    }
    state.digitSpan.sequence = seq;
    state.digitSpan.step = "display";

    DOM.labTabContent.innerHTML = `
      <div class="max-w-md mx-auto py-12 text-center space-y-6">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
          Level ${state.digitSpan.length} Digits
        </span>
        <div id="digit-flash-box" class="h-40 flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-6xl font-black text-slate-900 dark:text-white select-none">
          Get ready...
        </div>
        <p class="text-xs text-slate-400">Keep your eyes on the box</p>
      </div>
    `;

    setTimeout(() => {
      let idx = 0;
      const box = document.getElementById("digit-flash-box");
      const interval = setInterval(() => {
        if (!box) {
          clearInterval(interval);
          return;
        }
        if (idx < state.digitSpan.sequence.length) {
          box.textContent = state.digitSpan.sequence[idx];
          playSoftChime(440 + idx * 50, 0.2);
          idx++;
        } else {
          clearInterval(interval);
          box.textContent = "✓";
          setTimeout(() => {
            state.digitSpan.step = "recall";
            renderDigitSpanRecall();
          }, 600);
        }
      }, 950);
    }, 1000);
  }

  function renderDigitSpanRecall() {
    DOM.labTabContent.innerHTML = `
      <div class="max-w-md mx-auto py-8 text-center space-y-6">
        <span class="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full">
          Recall Phase (${state.digitSpan.length} digits)
        </span>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white">Type the numbers in exact order:</h4>

        <div class="space-y-4">
          <input 
            type="number" 
            id="digit-input" 
            class="w-full text-center tracking-widest text-3xl font-mono font-bold p-4 bg-slate-50 dark:bg-slate-800 border-2 border-indigo-500 rounded-2xl focus:outline-none" 
            placeholder="e.g. 742" 
            autofocus>

          <button id="btn-submit-digits" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all cursor-pointer">
            Submit Recall ⏎
          </button>
        </div>
      </div>
    `;

    const input = document.getElementById("digit-input");
    input?.focus();

    const handleSubmit = () => {
      const val = input.value.trim();
      const expected = state.digitSpan.sequence.join("");
      if (val === expected) {
        playSoftChime(880, 0.5);
        state.digitSpan.maxSpan = state.digitSpan.length;
        state.digitSpan.attempts = 0;
        state.digitSpan.length++;
        showToast(`Nailed it! Advanced to ${state.digitSpan.length} digits! ⭐`, "success");
        setTimeout(runDigitSpanSequence, 800);
      } else {
        playSoftChime(220, 0.5);
        state.digitSpan.attempts++;
        if (state.digitSpan.attempts >= 2) {
          state.digitSpan.step = "results";
          renderDigitSpanResults();
        } else {
          showToast(`Missed! The sequence was ${expected}. Try this length one more time!`, "warning");
          setTimeout(runDigitSpanSequence, 1200);
        }
      }
    };

    document.getElementById("btn-submit-digits")?.addEventListener("click", handleSubmit);
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSubmit();
    });
  }

  function renderDigitSpanResults() {
    const finalSpan = state.digitSpan.maxSpan;
    if (finalSpan >= 7) unlockAchievement("memory_prodigy");

    let evaluation = "Average human working memory capacity (Miller's Law: 7 ± 2).";
    if (finalSpan >= 9) evaluation = "Exceptional working memory capacity! You excel at phonological loop maintenance or chunking.";
    else if (finalSpan <= 4) evaluation = "Slightly below average immediate digit recall. Practice chunking numbers into 3-digit groups.";

    DOM.labTabContent.innerHTML = `
      <div class="max-w-xl mx-auto space-y-6 text-center">
        <div class="w-16 h-16 mx-auto rounded-3xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-3xl font-black">
          🗃️
        </div>
        <div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white">Your Working Memory Span: ${finalSpan} Digits</h3>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">${evaluation}</p>
        </div>

        <div class="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500">Working Memory Capacity Curve (Population):</h5>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span>Low-Average (4-5 digits):</span>
              <span class="text-slate-400">15% of population</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-400 h-2" style="width: 25%;"></div>
            </div>

            <div class="flex items-center justify-between font-bold text-indigo-600 dark:text-indigo-400">
              <span>Miller's Mean (6-8 digits):</span>
              <span>70% of population (Average)</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-600 h-2" style="width: 75%;"></div>
            </div>

            <div class="flex items-center justify-between">
              <span>Superior (9+ digits):</span>
              <span class="text-slate-400">15% of population</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="bg-emerald-500 h-2" style="width: 15%;"></div>
            </div>
          </div>
        </div>

        <button id="btn-replay-digitspan" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all cursor-pointer">
          Retest Working Memory 🔁
        </button>
      </div>
    `;

    document.getElementById("btn-replay-digitspan")?.addEventListener("click", () => {
      state.digitSpan.step = "intro";
      renderDigitSpanLab();
    });
  }

  // Lab C: Perception & Gestalt Sandbox
  function renderPerceptionLab() {
    if (!DOM.labTabContent) return;
    DOM.labTabContent.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-8">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
              Optical Illusion Sandbox 1
            </span>
            <span class="text-xs text-slate-400 font-medium">Müller-Lyer Illusion (1889)</span>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">Adjust the slider until both horizontal shafts appear equal:</h4>

          <div class="p-8 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-8">
            <div class="flex items-center justify-center select-none">
              <svg width="260" height="40" viewBox="0 0 260 40">
                <line x1="20" y1="20" x2="240" y2="20" stroke="currentColor" stroke-width="4" class="text-slate-900 dark:text-white"/>
                <line x1="35" y1="5" x2="20" y2="20" stroke="currentColor" stroke-width="4" class="text-slate-900 dark:text-white"/>
                <line x1="35" y1="35" x2="20" y2="20" stroke="currentColor" stroke-width="4" class="text-slate-900 dark:text-white"/>
                <line x1="225" y1="5" x2="240" y2="20" stroke="currentColor" stroke-width="4" class="text-slate-900 dark:text-white"/>
                <line x1="225" y1="35" x2="240" y2="20" stroke="currentColor" stroke-width="4" class="text-slate-900 dark:text-white"/>
              </svg>
            </div>

            <div class="flex items-center justify-center select-none">
              <svg id="ml-svg-adjustable" width="300" height="40" viewBox="0 0 300 40">
                <line id="ml-line-shaft" x1="50" y1="20" x2="250" y2="20" stroke="#6366f1" stroke-width="4"/>
                <line id="ml-fin-1" x1="35" y1="5" x2="50" y2="20" stroke="#6366f1" stroke-width="4"/>
                <line id="ml-fin-2" x1="35" y1="35" x2="50" y2="20" stroke="#6366f1" stroke-width="4"/>
                <line id="ml-fin-3" x1="265" y1="5" x2="250" y2="20" stroke="#6366f1" stroke-width="4"/>
                <line id="ml-fin-4" x1="265" y1="35" x2="250" y2="20" stroke="#6366f1" stroke-width="4"/>
              </svg>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-xs font-semibold text-slate-500">
              <span>Shorter</span>
              <span>Adjust Bottom Line Shaft</span>
              <span>Longer</span>
            </div>
            <input type="range" id="ml-slider" min="140" max="280" value="180" class="w-full accent-indigo-600 cursor-pointer">
          </div>

          <div class="flex items-center justify-between pt-2">
            <button id="btn-reveal-ml" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
              Reveal Physical Equality 📐
            </button>
            <span id="ml-feedback" class="text-xs font-semibold text-slate-500"></span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-full">
              Optical Illusion Sandbox 2
            </span>
            <span class="text-xs text-slate-400 font-medium">Rubin's Vase (1915)</span>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">Bistable Perception & Figure-Ground Segregation</h4>

          <div class="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div class="w-48 h-48 bg-slate-900 rounded-2xl flex items-center justify-center p-2 shadow-inner">
              <svg viewBox="0 0 100 100" class="w-full h-full" id="rubin-svg">
                <path id="rubin-path" d="M 25 10 C 35 15, 35 25, 40 35 C 45 45, 42 55, 48 65 C 44 75, 42 85, 30 90 L 70 90 C 58 85, 56 75, 52 65 C 58 55, 55 45, 60 35 C 65 25, 65 15, 75 10 Z" fill="#ffffff"/>
              </svg>
            </div>

            <div class="flex-1 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <p class="leading-relaxed">
                Created by Danish psychologist Edgar Rubin, this bistable figure illustrates that visual perception is an active interpretation rather than a passive camera snapshot. Your retinal inputs are identical, but your brain cannot perceive both the vase and the two opposing faces at the exact same millisecond.
              </p>
              <div class="flex items-center gap-2">
                <button id="btn-focus-vase" class="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 cursor-pointer">
                  Focus: White Vase 🏺
                </button>
                <button id="btn-focus-faces" class="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 cursor-pointer">
                  Focus: Two Faces 👥
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const slider = document.getElementById("ml-slider");
    const shaft = document.getElementById("ml-line-shaft");
    const fin3 = document.getElementById("ml-fin-3");
    const fin4 = document.getElementById("ml-fin-4");
    const feedback = document.getElementById("ml-feedback");

    slider?.addEventListener("input", (e) => {
      const len = parseInt(e.target.value, 10);
      const startX = 150 - len / 2;
      const endX = 150 + len / 2;
      shaft?.setAttribute("x1", startX);
      shaft?.setAttribute("x2", endX);
      fin3?.setAttribute("x1", endX + 15);
      fin3?.setAttribute("x2", endX);
      fin4?.setAttribute("x1", endX + 15);
      fin4?.setAttribute("x2", endX);
    });

    document.getElementById("btn-reveal-ml")?.addEventListener("click", () => {
      const currentVal = parseInt(slider.value, 10);
      const targetVal = 220;
      const diff = Math.abs(currentVal - targetVal);
      const pct = Math.round((diff / targetVal) * 100);
      feedback.textContent = `Physical equality is 220px. Your setting: ${currentVal}px (${pct}% illusion discrepancy!)`;
      feedback.className = "text-xs font-bold text-indigo-600 dark:text-indigo-400";
    });

    document.getElementById("btn-focus-vase")?.addEventListener("click", () => {
      document.getElementById("rubin-path")?.setAttribute("fill", "#6366f1");
    });
    document.getElementById("btn-focus-faces")?.addEventListener("click", () => {
      document.getElementById("rubin-path")?.setAttribute("fill", "#ffffff");
    });
  }

  // Lab D: Interactive SVG Brain Map
  const BRAIN_REGIONS = [
    {
      id: "frontal",
      title: "Frontal Lobe",
      color: "#6366f1",
      functions: "Executive function, abstract reasoning, future planning, working memory, impulse control, motor cortex, and Broca's area (speech production).",
      lesion: "Broca's Aphasia (broken telegraphic speech), perseveration, apathy, or profound personality disinhibition.",
      caseStudy: "Phineas Gage (1848): An iron rod blasted through his left frontal lobe; he survived but his personality shifted from polite to irreverent and impulsive.",
      neurotransmitters: "Dopamine (mesocortical pathway)."
    },
    {
      id: "parietal",
      title: "Parietal Lobe",
      color: "#06b6d4",
      functions: "Primary somatosensory cortex (homunculus map for touch, pain, temperature) and spatial attention navigation.",
      lesion: "Hemispatial Neglect (ignoring the left half of the visual field), Astereognosis (inability to identify 3D objects by touch).",
      caseStudy: "Patients with right parietal strokes will only eat food on the right half of their plate or draw clocks with numbers crowded into the right hemisphere.",
      neurotransmitters: "Acetylcholine & Glutamate."
    },
    {
      id: "occipital",
      title: "Occipital Lobe",
      color: "#10b981",
      functions: "Primary visual cortex (V1 / Striate cortex), retinotopic visual processing, Hubel & Wiesel feature detection (lines, edges, orientations).",
      lesion: "Cortical blindness, visual agnosia, prosopagnosia (inability to recognize familiar faces).",
      caseStudy: "Blindsight: Patients blind in their conscious field can still catch a ball thrown at them via intact subcortical collicular pathways.",
      neurotransmitters: "GABA & Glutamate."
    },
    {
      id: "temporal",
      title: "Temporal Lobe",
      color: "#f59e0b",
      functions: "Primary auditory cortex, Wernicke's area (speech comprehension), encoding declarative memories via adjacent hippocampus.",
      lesion: "Wernicke's Aphasia ('word salad', fluent speech with zero meaning and poor comprehension), retrograde amnesia.",
      caseStudy: "Clive Wearing: Severe bilateral temporal encephalitis destroyed his episodic memory, leaving him with an ongoing memory span of only 7 to 30 seconds.",
      neurotransmitters: "Acetylcholine (critical for memory encoding)."
    },
    {
      id: "cerebellum",
      title: "Cerebellum ('Little Brain')",
      color: "#ec4899",
      functions: "Motor coordination, timing precision, posture, balance, and procedural motor memory (e.g., riding a bike, playing piano).",
      lesion: "Cerebellar Ataxia: Jerky, uncoordinated gait, inability to perform smooth finger-to-nose movements.",
      caseStudy: "Alcohol intoxication specifically depresses cerebellar Purkinje neurons, leading to police sobriety test failures.",
      neurotransmitters: "GABA."
    },
    {
      id: "brainstem",
      title: "Brainstem (Medulla & Pons)",
      color: "#8b5cf6",
      functions: "Autonomic vital life support: respiration rate, cardiac heart rate, blood pressure, sleep-wake cycles (Reticular Activating System).",
      lesion: "Brain death or coma if the reticular formation is damaged.",
      caseStudy: "Locked-In Syndrome: Ventral pontine stroke paralyzes all voluntary muscles except vertical eye blinks while conscious cognition remains intact.",
      neurotransmitters: "Norepinephrine & Serotonin."
    },
    {
      id: "limbic",
      title: "Limbic System (Amygdala & Hippocampus)",
      color: "#ef4444",
      functions: "Amygdala mediates fear conditioning and emotional salience; Hippocampus consolidates short-term memories into cortex.",
      lesion: "Severe anterograde amnesia (inability to form new declarative memories), Klüver-Bucy syndrome (loss of fear).",
      caseStudy: "Patient H.M. (1953): Bilateral removal of medial temporal lobes and hippocampi left him unable to form any new conscious memory for 55 years.",
      neurotransmitters: "Glutamate (LTP) & Acetylcholine."
    }
  ];

  function renderBrainMapLab() {
    if (!DOM.labTabContent) return;
    DOM.labTabContent.innerHTML = `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-base font-extrabold text-slate-900 dark:text-white">Interactive Sagittal Brain Anatomy</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Click any anatomical lobe or structure to view its functional and clinical breakdown:</p>
          </div>
          <span class="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-full">Interactive SVG</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          <div class="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center">
            <svg viewBox="0 0 500 400" class="w-full max-w-md h-auto" id="brain-svg">
              <!-- Frontal Lobe -->
              <path id="lobe-frontal" class="brain-lobe transition-all" data-lobe="frontal" d="M 120 200 C 90 180, 80 120, 130 70 C 180 30, 260 30, 270 70 C 275 110, 240 170, 200 190 C 170 205, 140 210, 120 200 Z" fill="#6366f1" fill-opacity="0.8" stroke="#4f46e5" stroke-width="2"/>
              <text x="160" y="110" fill="#ffffff" font-size="13" font-weight="bold" pointer-events="none">Frontal Lobe</text>

              <!-- Parietal Lobe -->
              <path id="lobe-parietal" class="brain-lobe transition-all" data-lobe="parietal" d="M 270 70 C 310 40, 380 50, 400 100 C 410 130, 390 170, 340 180 C 300 180, 275 110, 270 70 Z" fill="#06b6d4" fill-opacity="0.8" stroke="#0891b2" stroke-width="2"/>
              <text x="315" y="115" fill="#ffffff" font-size="13" font-weight="bold" pointer-events="none">Parietal</text>

              <!-- Occipital Lobe -->
              <path id="lobe-occipital" class="brain-lobe transition-all" data-lobe="occipital" d="M 400 100 C 440 140, 440 190, 410 230 C 380 250, 350 230, 340 180 C 390 170, 410 130, 400 100 Z" fill="#10b981" fill-opacity="0.8" stroke="#059669" stroke-width="2"/>
              <text x="375" y="190" fill="#ffffff" font-size="12" font-weight="bold" pointer-events="none">Occipital</text>

              <!-- Temporal Lobe -->
              <path id="lobe-temporal" class="brain-lobe transition-all" data-lobe="temporal" d="M 200 190 C 240 170, 300 180, 340 180 C 350 230, 330 260, 260 270 C 210 275, 170 240, 200 190 Z" fill="#f59e0b" fill-opacity="0.8" stroke="#d97706" stroke-width="2"/>
              <text x="240" y="235" fill="#ffffff" font-size="13" font-weight="bold" pointer-events="none">Temporal Lobe</text>

              <!-- Cerebellum -->
              <path id="lobe-cerebellum" class="brain-lobe transition-all" data-lobe="cerebellum" d="M 330 260 C 370 250, 410 270, 400 320 C 380 360, 320 360, 300 320 C 290 295, 310 270, 330 260 Z" fill="#ec4899" fill-opacity="0.8" stroke="#db2777" stroke-width="2"/>
              <text x="325" y="320" fill="#ffffff" font-size="12" font-weight="bold" pointer-events="none">Cerebellum</text>

              <!-- Brainstem -->
              <path id="lobe-brainstem" class="brain-lobe transition-all" data-lobe="brainstem" d="M 260 270 C 290 295, 300 320, 290 380 C 265 385, 250 380, 250 310 C 250 285, 255 275, 260 270 Z" fill="#8b5cf6" fill-opacity="0.8" stroke="#7c3aed" stroke-width="2"/>
              <text x="220" y="355" fill="#ffffff" font-size="11" font-weight="bold" pointer-events="none">Brainstem</text>

              <!-- Limbic Core -->
              <ellipse id="lobe-limbic" class="brain-lobe transition-all" data-lobe="limbic" cx="265" cy="195" rx="30" ry="18" fill="#ef4444" fill-opacity="0.9" stroke="#b91c1c" stroke-width="2"/>
              <text x="245" y="198" fill="#ffffff" font-size="10" font-weight="extrabold" pointer-events="none">Limbic</text>
            </svg>

            <div class="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              ${BRAIN_REGIONS.map(r => `
                <button type="button" data-pick-lobe="${r.id}" class="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 transition-colors hover:scale-105 cursor-pointer" style="color: ${r.color};">
                  ${r.title.split("(")[0]}
                </button>
              `).join("")}
            </div>
          </div>

          <div id="brain-detail-card" class="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5">
          </div>
        </div>
      </div>
    `;

    const selectLobe = (lobeId) => {
      const reg = BRAIN_REGIONS.find(r => r.id === lobeId) || BRAIN_REGIONS[0];
      const card = document.getElementById("brain-detail-card");
      if (!card) return;

      document.querySelectorAll(".brain-lobe").forEach(el => {
        el.classList.remove("active-lobe");
      });
      document.getElementById(`lobe-${reg.id}`)?.classList.add("active-lobe");

      card.innerHTML = `
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
          <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded text-white" style="background-color: ${reg.color};">
            Anatomical Landmark
          </span>
          <h3 class="text-lg font-black text-slate-900 dark:text-white mt-2">${reg.title}</h3>
        </div>

        <div class="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <h5 class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Primary Functions:</h5>
            <p class="leading-relaxed mt-0.5">${reg.functions}</p>
          </div>

          <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200">
            <h5 class="font-bold uppercase tracking-wider text-[10px] text-rose-700 dark:text-rose-400">Clinical Lesion Symptoms:</h5>
            <p class="leading-relaxed mt-0.5">${reg.lesion}</p>
          </div>

          <div class="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200">
            <h5 class="font-bold uppercase tracking-wider text-[10px] text-indigo-700 dark:text-indigo-400">Famous Neuro Case:</h5>
            <p class="leading-relaxed mt-0.5">${reg.caseStudy}</p>
          </div>

          <div>
            <span class="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Neurotransmitters:</span>
            <span class="font-medium text-slate-900 dark:text-white ml-1">${reg.neurotransmitters}</span>
          </div>
        </div>
      `;

      const explored = JSON.parse(localStorage.getItem("psych_explored_lobes") || "[]");
      if (!explored.includes(reg.id)) {
        explored.push(reg.id);
        localStorage.setItem("psych_explored_lobes", JSON.stringify(explored));
        if (explored.length === BRAIN_REGIONS.length) {
          unlockAchievement("brain_explorer");
        }
      }
    };

    DOM.labTabContent.querySelectorAll(".brain-lobe").forEach(lobe => {
      lobe.addEventListener("click", () => selectLobe(lobe.getAttribute("data-lobe")));
    });

    DOM.labTabContent.querySelectorAll("[data-pick-lobe]").forEach(btn => {
      btn.addEventListener("click", () => selectLobe(btn.getAttribute("data-pick-lobe")));
    });

    selectLobe("frontal");
  }

  // 9. 40-Question Comprehensive Mock Final Exam
  function initMockExam() {
    const allQuestions = [];
    PSYCH_DATA.modules.forEach(m => {
      m.quiz.forEach(q => {
        allQuestions.push({
          ...q,
          moduleId: m.id,
          moduleNumber: m.number,
          moduleTitle: m.title
        });
      });
    });
    state.mockExam.questions = allQuestions;
  }

  function openMockExam() {
    DOM.modalMockexam?.classList.remove("hidden");
    if (!state.mockExam.active && !state.mockExam.submitted) {
      startMockExam();
    } else {
      renderMockExam();
    }
  }

  function startMockExam() {
    state.mockExam.active = true;
    state.mockExam.submitted = false;
    state.mockExam.answers = {};
    state.mockExam.flagged = {};
    state.mockExam.currentIndex = 0;
    state.mockExam.remaining = 30 * 60;

    if (state.mockExam.timerId) clearInterval(state.mockExam.timerId);
    state.mockExam.timerId = setInterval(() => {
      if (state.mockExam.remaining > 0) {
        state.mockExam.remaining--;
        const t = document.getElementById("mockexam-timer-display");
        if (t) {
          const m = Math.floor(state.mockExam.remaining / 60);
          const s = state.mockExam.remaining % 60;
          t.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
      } else {
        clearInterval(state.mockExam.timerId);
        submitMockExam();
      }
    }, 1000);

    renderMockExam();
  }

  function renderMockExam() {
    if (!DOM.mockexamBody) return;
    if (state.mockExam.submitted) {
      renderMockExamResults();
      return;
    }

    const q = state.mockExam.questions[state.mockExam.currentIndex];
    const totalQ = state.mockExam.questions.length;
    const answeredCount = Object.keys(state.mockExam.answers).length;
    const isFlagged = state.mockExam.flagged[state.mockExam.currentIndex];
    const selectedChoice = state.mockExam.answers[state.mockExam.currentIndex];

    const minutes = Math.floor(state.mockExam.remaining / 60);
    const seconds = state.mockExam.remaining % 60;
    const timerStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    DOM.mockexamBody.innerHTML = `
      <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-100 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Mod ${q.moduleNumber}: ${q.moduleTitle.split(":")[0]}</span>
            <span class="text-xs text-slate-400">&bull;</span>
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">Question ${state.mockExam.currentIndex + 1} of ${totalQ}</span>
          </div>

          <div class="flex items-center gap-3">
            <button id="me-btn-flag" class="px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isFlagged ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }">
              🚩 Flag for Review
            </button>
            <span id="mockexam-timer-display" class="font-timer text-sm font-extrabold px-3 py-1 bg-emerald-600 text-white rounded-xl shadow-xs">
              ${timerStr}
            </span>
          </div>
        </div>

        <div class="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
            <span>Exam Navigator (${answeredCount}/${totalQ} Answered)</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Passing: 70% (28/40)</span>
          </div>
          <div class="grid grid-cols-10 sm:grid-cols-20 gap-1">
            ${state.mockExam.questions.map((_, idx) => {
              const ans = state.mockExam.answers[idx] !== undefined;
              const flag = state.mockExam.flagged[idx];
              const isCur = idx === state.mockExam.currentIndex;
              return `
                <button 
                  type="button" 
                  data-jump-q="${idx}" 
                  class="h-7 text-[10px] font-extrabold rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    isCur 
                      ? 'ring-2 ring-indigo-500 bg-indigo-600 text-white' 
                      : flag
                        ? 'bg-amber-400 text-amber-950'
                        : ans
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                  }">
                  ${idx + 1}
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            ${q.question}
          </h3>

          <div class="space-y-2.5 pt-2">
            ${q.options.map((opt, oIdx) => `
              <button 
                type="button" 
                data-choice-idx="${oIdx}" 
                class="quiz-option w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  selectedChoice === oIdx ? 'selected font-bold border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' : ''
                }">
                <span class="text-slate-800 dark:text-slate-200">${opt}</span>
                <div class="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center ${
                  selectedChoice === oIdx ? 'border-indigo-600 bg-indigo-600' : ''
                }">
                  ${selectedChoice === oIdx ? '<div class="w-1.5 h-1.5 rounded-full bg-white"></div>' : ''}
                </div>
              </button>
            `).join("")}
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 pt-2">
          <button id="me-btn-prev" class="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer ${
            state.mockExam.currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''
          }">
            &larr; Previous
          </button>

          <div class="flex items-center gap-2">
            <button id="me-btn-submit" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer">
              Finish & Submit Exam 🏁
            </button>
            <button id="me-btn-next" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
              state.mockExam.currentIndex === totalQ - 1 ? 'opacity-40 cursor-not-allowed' : ''
            }">
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    `;

    DOM.mockexamBody.querySelectorAll("[data-jump-q]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.mockExam.currentIndex = parseInt(btn.getAttribute("data-jump-q"), 10);
        renderMockExam();
      });
    });

    DOM.mockexamBody.querySelectorAll("[data-choice-idx]").forEach(btn => {
      btn.addEventListener("click", () => {
        const oIdx = parseInt(btn.getAttribute("data-choice-idx"), 10);
        state.mockExam.answers[state.mockExam.currentIndex] = oIdx;
        renderMockExam();
      });
    });

    document.getElementById("me-btn-flag")?.addEventListener("click", () => {
      state.mockExam.flagged[state.mockExam.currentIndex] = !state.mockExam.flagged[state.mockExam.currentIndex];
      renderMockExam();
    });

    document.getElementById("me-btn-prev")?.addEventListener("click", () => {
      if (state.mockExam.currentIndex > 0) {
        state.mockExam.currentIndex--;
        renderMockExam();
      }
    });

    document.getElementById("me-btn-next")?.addEventListener("click", () => {
      if (state.mockExam.currentIndex < totalQ - 1) {
        state.mockExam.currentIndex++;
        renderMockExam();
      }
    });

    document.getElementById("me-btn-submit")?.addEventListener("click", () => {
      const remainingQ = totalQ - Object.keys(state.mockExam.answers).length;
      if (remainingQ > 0) {
        if (!confirm(`You have ${remainingQ} unanswered question(s). Are you sure you want to finish and submit?`)) return;
      }
      submitMockExam();
    });
  }

  function submitMockExam() {
    if (state.mockExam.timerId) clearInterval(state.mockExam.timerId);
    state.mockExam.submitted = true;
    let score = 0;

    state.mockExam.questions.forEach((q, idx) => {
      if (state.mockExam.answers[idx] === q.correctIndex) {
        score++;
      }
    });

    state.mockExam.score = score;
    const pct = Math.round((score / state.mockExam.questions.length) * 100);

    const prevBest = parseInt(localStorage.getItem("psych_mockexam_best") || "0", 10);
    if (score > prevBest) {
      localStorage.setItem("psych_mockexam_best", score);
    }

    if (pct >= 70) {
      unlockAchievement("exam_graduate");
      playSoftChime(880, 1.5);
      showToast(`🏆 Congratulations! Passed Mock Final Exam with ${pct}%!`, "success");
    } else {
      showToast(`Exam complete: ${score}/40 (${pct}%). Review your mistakes below.`, "info");
    }

    renderMockExamResults();
  }

  function renderMockExamResults() {
    if (!DOM.mockexamBody) return;
    const score = state.mockExam.score;
    const totalQ = state.mockExam.questions.length;
    const pct = Math.round((score / totalQ) * 100);
    const passed = pct >= 70;

    const moduleStats = {};
    PSYCH_DATA.modules.forEach(m => {
      moduleStats[m.id] = { title: m.title.split(":")[0], total: 0, correct: 0 };
    });

    state.mockExam.questions.forEach((q, idx) => {
      moduleStats[q.moduleId].total++;
      if (state.mockExam.answers[idx] === q.correctIndex) {
        moduleStats[q.moduleId].correct++;
      }
    });

    DOM.mockexamBody.innerHTML = `
      <div class="space-y-6 max-w-3xl mx-auto">
        <div class="p-6 rounded-3xl border text-center space-y-3 ${
          passed 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
        }">
          <div class="text-4xl">${passed ? '🎓' : '📚'}</div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white">
            ${passed ? 'Mock Final Exam Passed!' : 'Review Recommended'}
          </h3>
          <div class="text-3xl font-extrabold ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
            ${score} / ${totalQ} (${pct}%)
          </div>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            ${passed ? 'Outstanding mastery across all 8 core psychological domains. You are well prepared for college-level exams!' : 'Passing threshold is 70% (28/40). Review domain breakdowns below to target your study.'}
          </p>
        </div>

        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Curriculum Domain Diagnostic Breakdown:</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            ${Object.values(moduleStats).map(ms => {
              const mPct = Math.round((ms.correct / ms.total) * 100);
              return `
                <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span class="truncate">${ms.title}</span>
                    <span class="${mPct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">${ms.correct}/${ms.total} (${mPct}%)</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div class="${mPct >= 70 ? 'bg-emerald-500' : 'bg-amber-500'} h-1.5" style="width: ${mPct}%;"></div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Rationales & Answers:</h4>
          ${state.mockExam.questions.map((q, idx) => {
            const userAns = state.mockExam.answers[idx];
            const isCorrect = userAns === q.correctIndex;
            return `
              <div class="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs sm:text-sm">
                <div class="flex items-start justify-between gap-2">
                  <span class="font-bold text-slate-900 dark:text-white">Q${idx + 1}: ${q.question}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold flex-shrink-0 ${
                    isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }">
                    ${isCorrect ? '✓ Correct' : '✕ Missed'}
                  </span>
                </div>

                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <div><strong>Your Choice:</strong> <span class="${isCorrect ? 'text-emerald-600 font-bold' : 'text-rose-500 font-semibold'}">${userAns !== undefined ? q.options[userAns] : 'None selected'}</span></div>
                  ${!isCorrect ? `<div><strong>Correct Choice:</strong> <span class="text-emerald-600 font-bold">${q.options[q.correctIndex]}</span></div>` : ''}
                  <p class="text-slate-500 dark:text-slate-400 mt-1 italic leading-relaxed">💡 ${q.explanation}</p>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button id="me-btn-retake" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer">
            Retake Mock Exam 🔁
          </button>
          <button id="me-btn-close-final" class="px-5 py-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-colors cursor-pointer">
            Done
          </button>
        </div>
      </div>
    `;

    document.getElementById("me-btn-retake")?.addEventListener("click", startMockExam);
    document.getElementById("me-btn-close-final")?.addEventListener("click", () => DOM.modalMockexam?.classList.add("hidden"));
  }

  // 10. Hub Modals Wireup
  function initHubModals() {
    // Cognitive Labs
    const openLabsHandler = () => openCognitiveLabs("stroop");
    DOM.btnOpenLabs?.addEventListener("click", openLabsHandler);
    DOM.sidebarBtnLabs?.addEventListener("click", openLabsHandler);
    DOM.mobileBtnLabs?.addEventListener("click", () => {
      closeMobileMenu();
      openLabsHandler();
    });
    DOM.modalLabsClose?.addEventListener("click", () => DOM.modalLabs?.classList.add("hidden"));

    // Speed Match
    const openSpeedMatchHandler = () => openSpeedMatch();
    DOM.btnOpenSpeedmatch?.addEventListener("click", openSpeedMatchHandler);
    DOM.sidebarBtnSpeedmatch?.addEventListener("click", openSpeedMatchHandler);
    DOM.mobileBtnSpeedmatch?.addEventListener("click", () => {
      closeMobileMenu();
      openSpeedMatchHandler();
    });
    DOM.modalSpeedmatchClose?.addEventListener("click", () => DOM.modalSpeedmatch?.classList.add("hidden"));

    // Mock Exam
    const openMockExamHandler = () => openMockExam();
    DOM.btnOpenMockexam?.addEventListener("click", openMockExamHandler);
    DOM.sidebarBtnMockexam?.addEventListener("click", openMockExamHandler);
    DOM.mobileBtnMockexam?.addEventListener("click", () => {
      closeMobileMenu();
      openMockExamHandler();
    });
    DOM.modalMockexamClose?.addEventListener("click", () => DOM.modalMockexam?.classList.add("hidden"));

    // Streaks & Badges
    const openStreaksHandler = () => {
      renderStreaksModal();
      DOM.modalStreaks?.classList.remove("hidden");
    };
    DOM.btnStreakBadge?.addEventListener("click", openStreaksHandler);
    DOM.modalStreaksClose?.addEventListener("click", () => DOM.modalStreaks?.classList.add("hidden"));

    // Learning Roadmap Guide
    const openGuideHandler = () => openLearningGuideModal();
    DOM.btnOpenGuide?.addEventListener("click", openGuideHandler);
    DOM.mobileBtnGuide?.addEventListener("click", () => {
      closeMobileMenu();
      openGuideHandler();
    });
    DOM.modalGuideClose?.addEventListener("click", () => DOM.modalGuide?.classList.add("hidden"));
    DOM.modalGuideAction?.addEventListener("click", () => {
      DOM.modalGuide?.classList.add("hidden");
      resumeNextRecommendedStep();
    });

    // Next Up Resume Button in Sidebar & Mobile Drawer
    DOM.sidebarBtnResume?.addEventListener("click", resumeNextRecommendedStep);
    DOM.mobileBtnResume?.addEventListener("click", () => {
      closeMobileMenu();
      resumeNextRecommendedStep();
    });

    initCognitiveLabs();
    initMockExam();
  }

  // Update Global Stats in Sidebar
  function updateStatsBadges() {
    const totalCards = PSYCH_DATA.modules.reduce((acc, m) => acc + m.flashcards.length, 0);
    
    let srsMasteredCount = 0;
    Object.values(state.srsCards).forEach(cardState => {
      if (cardState.ease === "easy" || cardState.intervalDays >= 7) {
        srsMasteredCount++;
      }
    });

    if (DOM.totalMasteredBadge) {
      DOM.totalMasteredBadge.textContent = `${srsMasteredCount} / ${totalCards} Terms`;
    }

    if (srsMasteredCount >= 8) {
      unlockAchievement("srs_scholar");
    }

    const totalQuizzes = PSYCH_DATA.modules.length;
    const completedQuizCount = Object.keys(state.userProgress.completedQuizzes).length;
    const pct = Math.round(((completedQuizCount / totalQuizzes) * 0.5 + (srsMasteredCount / totalCards) * 0.5) * 100);

    if (DOM.overallProgressFill) {
      DOM.overallProgressFill.style.width = `${pct}%`;
    }
    if (DOM.overallProgressPct) {
      DOM.overallProgressPct.textContent = `${pct}% Complete`;
    }
    updateSidebarNextUpCard();
  }

  // ==========================================
  // GUIDED COGNITIVE LEARNING ROADMAP SYSTEM
  // ==========================================

  function getModuleStepState(modId) {
    if (!state.moduleSteps[modId]) {
      state.moduleSteps[modId] = {
        guide: false,
        video: false,
        flashcards: false,
        caseStudy: false,
        quiz: false
      };
    }
    const ms = state.moduleSteps[modId];
    if (state.userProgress.completedQuizzes[modId] >= 3) {
      ms.quiz = true;
    }
    const mod = PSYCH_DATA.modules.find(m => m.id === modId);
    if (mod) {
      if (mod.caseStudies && mod.caseStudies.some(cs => state.caseStudyAnswers[cs.id] !== undefined)) {
        ms.caseStudy = true;
      }
      if (mod.flashcards && mod.flashcards.some(fc => state.srsCards[fc.id])) {
        ms.flashcards = true;
      }
    }
    return ms;
  }

  function setModuleStepComplete(modId, stepKey) {
    const s = getModuleStepState(modId);
    if (!s[stepKey]) {
      s[stepKey] = true;
      localStorage.setItem("psych_module_steps", JSON.stringify(state.moduleSteps));
      renderModuleStepper();
      updateSidebarNextUpCard();
    }
  }

  function getRecommendedStepForModule(modId) {
    const s = getModuleStepState(modId);
    if (!s.guide) return "guide";
    if (!s.video) return "video";
    if (!s.flashcards) return "flashcards";
    if (!s.caseStudy) return "caseStudy";
    if (!s.quiz) return "quiz";
    return "done";
  }

  function getGlobalNextRecommendation() {
    for (let i = 0; i < PSYCH_DATA.modules.length; i++) {
      const mod = PSYCH_DATA.modules[i];
      const s = getModuleStepState(mod.id);
      if (!s.guide) {
        return {
          moduleId: mod.id,
          tab: "study",
          stepName: "Read Guide",
          title: `Module ${mod.number}: Read Study Guide`,
          desc: `Build core mental schema for ${mod.title}.`,
          isExam: false
        };
      }
      if (!s.video) {
        return {
          moduleId: mod.id,
          tab: "resources",
          stepName: "Watch Media",
          title: `Module ${mod.number}: Watch Video Lecture`,
          desc: `Dual-coding visual crash course for ${mod.title}.`,
          isExam: false
        };
      }
      if (!s.flashcards) {
        return {
          moduleId: mod.id,
          tab: "flashcards",
          stepName: "Active Recall",
          title: `Module ${mod.number}: Active Recall Cards`,
          desc: `Test memory before flipping cards for ${mod.title}.`,
          isExam: false
        };
      }
      if (!s.caseStudy) {
        return {
          moduleId: mod.id,
          tab: "case-study",
          stepName: "Case Study",
          title: `Module ${mod.number}: Clinical Dilemma`,
          desc: `Solve the behavioral case study for ${mod.title}.`,
          isExam: false
        };
      }
      if (!s.quiz) {
        return {
          moduleId: mod.id,
          tab: "quiz",
          stepName: "Practice Quiz",
          title: `Module ${mod.number}: Practice Quiz`,
          desc: `Test mastery on 5 questions for ${mod.title}.`,
          isExam: false
        };
      }
    }
    return {
      moduleId: "intro-history",
      tab: "mockexam",
      stepName: "Mock Final Exam",
      title: "Comprehensive Mock Final Exam",
      desc: "All 8 modules mastered! Test yourself with 40 AP/college questions.",
      isExam: true
    };
  }

  function resumeNextRecommendedStep() {
    const rec = getGlobalNextRecommendation();
    if (rec.isExam) {
      openMockExam();
    } else {
      if (state.currentModuleId !== rec.moduleId) {
        switchModule(rec.moduleId);
      }
      switchTab(rec.tab);
    }
  }

  function updateSidebarNextUpCard() {
    const rec = getGlobalNextRecommendation();
    if (DOM.sidebarNextUpTitle) {
      DOM.sidebarNextUpTitle.textContent = rec.title;
    }
    if (DOM.sidebarNextUpDesc) {
      DOM.sidebarNextUpDesc.textContent = rec.desc;
    }
    if (DOM.sidebarBtnResumeLabel) {
      DOM.sidebarBtnResumeLabel.textContent = rec.isExam ? "Take Final Exam" : "Continue Learning";
    }

    if (DOM.mobileNextUpTitle) {
      DOM.mobileNextUpTitle.textContent = rec.title;
    }
    if (DOM.mobileNextUpDesc) {
      DOM.mobileNextUpDesc.textContent = rec.desc;
    }
    if (DOM.mobileBtnResumeLabel) {
      DOM.mobileBtnResumeLabel.textContent = rec.isExam ? "Take Final Exam" : "Continue Learning";
    }
  }

  function renderModuleStepper() {
    if (!DOM.moduleStepper) return;
    const mod = getCurrentModule();
    const s = getModuleStepState(mod.id);
    const recommended = getRecommendedStepForModule(mod.id);

    const steps = [
      { key: "guide", tab: "study", num: "1", icon: "📖", title: "Read Guide", short: "Guide" },
      { key: "video", tab: "resources", num: "2", icon: "🎬", title: "Watch Video", short: "Video" },
      { key: "flashcards", tab: "flashcards", num: "3", icon: "🎴", title: "Active Recall", short: "Recall" },
      { key: "caseStudy", tab: "case-study", num: "4", icon: "🧩", title: "Case Study", short: "Case" },
      { key: "quiz", tab: "quiz", num: "5", icon: "✍️", title: "Practice Quiz", short: "Quiz" }
    ];

    let completedCount = 0;
    steps.forEach(st => {
      if (s[st.key]) completedCount++;
    });
    const pct = Math.round((completedCount / steps.length) * 100);

    let html = `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>🧭</span>
              <span>5-Step Cognitive Loop</span>
            </span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${completedCount === 5 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}">
              ${completedCount}/5 Complete (${pct}%)
            </span>
          </div>
          <button id="btn-why-order" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Study Method</span>
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
    `;

    steps.forEach(st => {
      const isDone = s[st.key];
      const isCurrentTab = state.currentTab === st.tab;
      const isRec = recommended === st.key;

      let styleClasses = "border ";
      if (isCurrentTab) {
        styleClasses += "ring-2 ring-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold ";
      } else if (isRec && !isDone) {
        styleClasses += "step-active-pulse border-indigo-400 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 font-bold ";
      } else if (isDone) {
        styleClasses += "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold ";
      } else {
        styleClasses += "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ";
      }

      html += `
        <button data-stepper-tab="${st.tab}" class="${styleClasses} p-2 rounded-xl text-left transition-all flex items-center justify-between gap-1 cursor-pointer select-none">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-xs">
              <span class="text-sm">${st.icon}</span>
              <span class="truncate font-bold">${st.num}. ${st.short}</span>
            </div>
          </div>
          <div class="flex-shrink-0">
            ${isDone 
              ? '<span class="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>' 
              : isRec 
                ? '<span class="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-600 text-white animate-pulse">Next</span>' 
                : '<span class="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 block"></span>'
            }
          </div>
        </button>
      `;
    });

    html += `
        </div>
      </div>
    `;

    DOM.moduleStepper.innerHTML = html;

    DOM.moduleStepper.querySelectorAll("[data-stepper-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        const tabKey = btn.getAttribute("data-stepper-tab");
        switchTab(tabKey);
      });
    });

    document.getElementById("btn-why-order")?.addEventListener("click", openLearningGuideModal);
  }

  function openLearningGuideModal() {
    DOM.modalGuide?.classList.remove("hidden");
  }

  // Render Sidebar Navigation
  function renderSidebar() {
    const renderItems = (container) => {
      if (!container) return;
      container.innerHTML = "";

      PSYCH_DATA.modules.forEach(mod => {
        const isActive = mod.id === state.currentModuleId;
        const isQuizPassed = state.userProgress.completedQuizzes[mod.id] >= 4;

        const btn = document.createElement("button");
        btn.className = `w-full text-left p-3 rounded-2xl transition-all flex items-center gap-3 cursor-pointer ${
          isActive 
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 font-bold" 
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        }`;

        btn.innerHTML = `
          <div class="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
            isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          }">
            ${mod.number}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <span class="text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-800 dark:text-slate-100"}">${mod.title}</span>
              ${isQuizPassed ? '<span class="text-xs bg-emerald-400 text-emerald-950 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">✓ Quiz</span>' : ''}
            </div>
            <p class="text-xs truncate ${isActive ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"} mt-0.5">${mod.sections.length} topics &bull; 1 Case Study</p>
          </div>
        `;

        btn.addEventListener("click", () => {
          switchModule(mod.id);
          closeMobileMenu();
        });

        container.appendChild(btn);
      });
    };

    renderItems(DOM.sidebarModules);
    renderItems(DOM.mobileSidebarModules);
  }

  // Switch Module
  function switchModule(moduleId) {
    if (state.currentModuleId === moduleId) return;
    stopSpeaking();
    state.currentModuleId = moduleId;
    state.currentTab = "study";
    state.quiz.answers = {};
    state.quiz.submitted = false;
    state.quiz.score = 0;
    resetFlashcardsForCurrentModule();
    loadScratchpadForModule(moduleId);
    renderSidebar();
    renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Switch Tab
  function switchTab(tabKey) {
    stopSpeaking();
    state.currentTab = tabKey;
    if (tabKey === "flashcards") {
      state.flashcard.isFlipped = false;
    }
    renderHeaderAndTabs();
    renderModuleStepper();
    renderTabContent();
    updateSidebarNextUpCard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Reset Flashcards for Current Module
  function resetFlashcardsForCurrentModule() {
    const mod = getCurrentModule();
    state.flashcard.index = 0;
    state.flashcard.isFlipped = false;
    state.flashcard.filter = "all";
    state.flashcard.mode = "flip";
    state.flashcard.shuffledCards = [...mod.flashcards];
  }

  function getFilteredFlashcards() {
    const cards = state.flashcard.shuffledCards;
    const now = Date.now();

    if (state.flashcard.filter === "due") {
      return cards.filter(c => {
        const srs = state.srsCards[c.id];
        if (!srs) return true;
        return srs.nextReviewDate <= now;
      });
    }
    if (state.flashcard.filter === "mastered") {
      return cards.filter(c => {
        const srs = state.srsCards[c.id];
        return srs && (srs.ease === "easy" || srs.intervalDays >= 7);
      });
    }
    return cards;
  }

  // Main Render Controller
  function renderCurrentView() {
    renderHeaderAndTabs();
    renderModuleStepper();
    renderTabContent();
    updateSidebarNextUpCard();
  }

  // Render Header & Tab Navigation
  function renderHeaderAndTabs() {
    const mod = getCurrentModule();

    if (DOM.moduleHeader) {
      DOM.moduleHeader.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-4 mb-2.5">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Module ${mod.number}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ${mod.readTime}
            </span>
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
            ${mod.flashcards.length} Flashcards &bull; ${mod.quiz.length} Quiz Questions &bull; 1 Case Study
          </div>
        </div>
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${mod.title}</h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">${mod.tagline}</p>
          </div>
          <button id="btn-listen-module" title="Read overview aloud" class="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors flex-shrink-0 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
          </button>
        </div>
      `;

      document.getElementById("btn-listen-module")?.addEventListener("click", function () {
        speakText(`${mod.title}. ${mod.summary}`, this);
      });
    }

    if (DOM.moduleTabs) {
      const tabs = [
        { key: "study", label: "Study Guide", icon: "book" },
        { key: "flashcards", label: `Study Cards (${mod.flashcards.length})`, icon: "layers" },
        { key: "quiz", label: `Practice Quiz (${mod.quiz.length})`, icon: "check" },
        { key: "case-study", label: `Case Study (1)`, icon: "puzzle" },
        { key: "resources", label: "Curated Media", icon: "video" }
      ];

      DOM.moduleTabs.innerHTML = "";
      tabs.forEach(t => {
        const isActive = state.currentTab === t.key;
        const btn = document.createElement("button");
        btn.className = `pb-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
          isActive 
            ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
        }`;
        
        let iconSvg = "";
        if (t.key === "study") {
          iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`;
        } else if (t.key === "flashcards") {
          iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`;
        } else if (t.key === "quiz") {
          iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        } else if (t.key === "case-study") {
          iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`;
        } else {
          iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
        }

        btn.innerHTML = `${iconSvg} <span>${t.label}</span>`;
        btn.addEventListener("click", () => switchTab(t.key));
        DOM.moduleTabs.appendChild(btn);
      });
    }
  }

  // Render Active Tab Content
  function renderTabContent() {
    if (!DOM.tabContent) return;
    DOM.tabContent.innerHTML = "";
    DOM.tabContent.className = "fade-in";

    const mod = getCurrentModule();

    if (state.currentTab === "study") {
      renderStudyGuideView(mod);
    } else if (state.currentTab === "flashcards") {
      renderFlashcardsView(mod);
    } else if (state.currentTab === "quiz") {
      renderQuizView(mod);
    } else if (state.currentTab === "case-study") {
      renderCaseStudyView(mod);
    } else if (state.currentTab === "resources") {
      renderResourcesView(mod);
    }
  }

  // 1. Study Guide View
  function renderStudyGuideView(mod) {
    setModuleStepComplete(mod.id, "guide");
    const container = document.createElement("div");
    container.className = "space-y-8";

    const summaryBox = document.createElement("div");
    summaryBox.className = "bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-950 rounded-2xl p-6 shadow-sm";
    summaryBox.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="flex-1">
          <h2 class="text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Module Overview</h2>
          <p class="text-slate-700 dark:text-slate-300 leading-relaxed mt-1 text-sm sm:text-base">${mod.summary}</p>
        </div>
      </div>
    `;
    container.appendChild(summaryBox);

    if (mod.id === "biological") {
      const brainBanner = document.createElement("div");
      brainBanner.className = "bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-5 flex items-center justify-between gap-4";
      brainBanner.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg">🧠</div>
          <div>
            <h4 class="text-sm font-bold text-purple-950 dark:text-purple-200">Interactive Brain Anatomy Map</h4>
            <p class="text-xs text-purple-900/70 dark:text-purple-300/70">Explore lobes, clinical lesions (Phineas Gage, Patient H.M.), and neural pathways.</p>
          </div>
        </div>
        <button id="btn-jump-brainmap" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer">
          Open Brain Map 🔬
        </button>
      `;
      container.appendChild(brainBanner);
      brainBanner.querySelector("#btn-jump-brainmap")?.addEventListener("click", () => openCognitiveLabs("brain"));
    }

    mod.sections.forEach((sec) => {
      const secCard = document.createElement("article");
      secCard.className = "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 transition-colors";

      const formattedContent = sec.content
        .split("\n\n")
        .map(paragraph => {
          if (paragraph.startsWith("- ")) {
            const listItems = paragraph
              .split("\n")
              .map(item => `<li class="flex items-start gap-2"><span class="text-indigo-500 font-bold">•</span><span>${item.replace(/^- /, "")}</span></li>`)
              .join("");
            return `<ul class="space-y-1.5 my-3">${listItems}</ul>`;
          }
          const withBold = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>');
          return `<p class="leading-relaxed text-sm sm:text-base">${withBold}</p>`;
        })
        .join("");

      let analogyHtml = "";
      if (sec.analogy) {
        analogyHtml = `
          <div class="analogy-callout rounded-xl p-5 text-sm my-4">
            <div class="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 mb-1">
              <span class="text-base">💡</span>
              <span>Conceptual Analogy: ${sec.analogy.metaphor}</span>
            </div>
            <p class="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">${sec.analogy.explanation}</p>
          </div>
        `;
      }

      let critiqueHtml = "";
      if (sec.criticalThinking) {
        critiqueHtml = `
          <div class="bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-r-xl p-4 text-xs sm:text-sm text-amber-950 dark:text-amber-200 my-4">
            <span class="font-bold block uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-400 mb-0.5">Critical Thinking Dilemma</span>
            <p class="leading-relaxed">${sec.criticalThinking}</p>
          </div>
        `;
      }

      let keyPointsHtml = "";
      if (sec.keyPoints && sec.keyPoints.length > 0) {
        keyPointsHtml = `
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">High-Yield Takeaways</h4>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              ${sec.keyPoints.map(kp => `<li class="flex items-start gap-2"><span class="text-emerald-500 font-bold">•</span><span>${kp}</span></li>`).join("")}
            </ul>
          </div>
        `;
      }

      secCard.innerHTML = `
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between gap-3">
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">${sec.title}</h3>
          <button type="button" data-tts-sec="${sec.id}" class="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer" title="Read section aloud">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
          </button>
        </div>
        <div class="prose max-w-none text-slate-700 dark:text-slate-300">
          ${formattedContent}
        </div>
        ${analogyHtml}
        ${critiqueHtml}
        ${keyPointsHtml}
      `;

      container.appendChild(secCard);

      secCard.querySelector(`[data-tts-sec="${sec.id}"]`)?.addEventListener("click", function () {
        speakText(`${sec.title}. ${sec.content}`, this);
      });
    });

    unlockAchievement("curious_mind");

    const bottomNav = document.createElement("div");
    bottomNav.className = "flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-indigo-900/60 rounded-2xl shadow-sm";
    bottomNav.innerHTML = `
      <div>
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Step 1 Complete</span>
          <span>&bull;</span>
          <span>Next: Curated Media (Step 2)</span>
        </div>
        <h4 class="font-extrabold text-slate-900 dark:text-white text-base mt-1">Ready to solidify what you just read?</h4>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Watch the curated CrashCourse episode to encode visual and auditory memories (Dual-Coding Theory).</p>
      </div>
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button id="btn-goto-media" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span>Next: Watch Media (Step 2)</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    `;

    container.appendChild(bottomNav);
    DOM.tabContent.appendChild(container);

    document.getElementById("btn-goto-media")?.addEventListener("click", () => switchTab("resources"));
  }

  // 2. Upgraded Flashcards View
  function renderFlashcardsView(mod) {
    const cards = getFilteredFlashcards();
    const totalCardsInModule = mod.flashcards.length;
    const now = Date.now();

    const dueCount = mod.flashcards.filter(c => {
      const srs = state.srsCards[c.id];
      return !srs || srs.nextReviewDate <= now;
    }).length;

    const masteredCount = mod.flashcards.filter(c => {
      const srs = state.srsCards[c.id];
      return srs && (srs.ease === "easy" || srs.intervalDays >= 7);
    }).length;

    const wrapper = document.createElement("div");
    wrapper.className = "space-y-6 max-w-2xl mx-auto";

    const topBar = document.createElement("div");
    topBar.className = "flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm";

    topBar.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mode:</span>
        <div class="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button id="mode-flip" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${state.flashcard.mode === 'flip' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}">🎴 3D Flip</button>
          <button id="mode-recall" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${state.flashcard.mode === 'recall' ? 'bg-white dark:bg-slate-700 shadow text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-slate-400'}">✍️ Active Recall</button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button id="filter-all" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${state.flashcard.filter === 'all' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}">All (${totalCardsInModule})</button>
          <button id="filter-due" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${state.flashcard.filter === 'due' ? 'bg-white dark:bg-slate-700 shadow text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}">Due (${dueCount})</button>
          <button id="filter-mastered" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${state.flashcard.filter === 'mastered' ? 'bg-white dark:bg-slate-700 shadow text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}">Mastered (${masteredCount})</button>
        </div>
        <button id="btn-shuffle-cards" title="Shuffle flashcards" class="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>
      </div>
    `;
    wrapper.appendChild(topBar);

    if (cards.length === 0) {
      const emptyCard = document.createElement("div");
      emptyCard.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm space-y-4";
      emptyCard.innerHTML = `
        <div class="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-slate-800 dark:text-white">${state.flashcard.filter === 'due' ? 'All caught up! Zero cards due for review.' : 'No cards found in this filter.'}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">${state.flashcard.filter === 'due' ? 'Your spaced repetition schedule has no overdue cards for this module right now.' : 'Mark some cards as Easy/Mastered to populate this list.'}</p>
        <button id="btn-reset-filter" class="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all cursor-pointer">Show All Flashcards</button>
      `;
      wrapper.appendChild(emptyCard);
      DOM.tabContent.appendChild(wrapper);

      document.getElementById("btn-reset-filter")?.addEventListener("click", () => {
        state.flashcard.filter = "all";
        renderFlashcardsView(mod);
      });
      hookFlashcardFilters(mod);
      return;
    }

    if (state.flashcard.index >= cards.length) {
      state.flashcard.index = 0;
    }
    const currentCard = cards[state.flashcard.index];
    const srsData = state.srsCards[currentCard.id] || { ease: "none", reviewCount: 0, intervalDays: 0, nextReviewDate: 0 };

    let srsStatusBadge = '<span class="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">New Card</span>';
    if (srsData.reviewCount > 0) {
      if (srsData.ease === "hard") {
        srsStatusBadge = `<span class="text-xs bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full font-bold">Hard &bull; Re-queue</span>`;
      } else if (srsData.ease === "good") {
        srsStatusBadge = `<span class="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full font-bold">Good &bull; Reviewed ${srsData.reviewCount}x</span>`;
      } else if (srsData.ease === "easy") {
        srsStatusBadge = `<span class="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-bold">✓ Mastered (7d)</span>`;
      }
    }

    const progressHeader = document.createElement("div");
    progressHeader.className = "flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1";
    progressHeader.innerHTML = `
      <span>Card ${state.flashcard.index + 1} of ${cards.length}</span>
      <div class="flex items-center gap-2">
        ${srsStatusBadge}
        <button id="btn-listen-card" title="Listen to card" class="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
        </button>
      </div>
    `;
    wrapper.appendChild(progressHeader);

    // MODE 1: Standard 3D Flip Card
    if (state.flashcard.mode === "flip") {
      const cardScene = document.createElement("div");
      cardScene.className = "perspective-1000 w-full min-h-[380px] cursor-pointer select-none";
      cardScene.id = "flashcard-scene";

      cardScene.innerHTML = `
        <div id="flashcard-inner" class="flashcard-inner transform-style-3d relative w-full h-full min-h-[380px] rounded-3xl shadow-lg border border-slate-200/90 dark:border-slate-800 ${state.flashcard.isFlipped ? 'is-flipped' : ''}">
          <div class="backface-hidden absolute inset-0 bg-white dark:bg-slate-900 rounded-3xl p-7 flex flex-col justify-between overflow-y-auto">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full">
                Term &bull; Click to Flip
              </span>
              <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">Space to flip ␣</span>
            </div>

            <div class="my-auto py-6 text-center">
              <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${currentCard.term}</h3>
              ${currentCard.hint ? `<p class="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic max-w-md mx-auto">💡 Hint: ${currentCard.hint}</p>` : ''}
            </div>

            <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>SRS Review: ${srsData.reviewCount} times</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                Reveal definition & rate &rarr;
              </span>
            </div>
          </div>

          <div class="backface-hidden rotate-y-180 absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-7 flex flex-col justify-between overflow-y-auto">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                Definition & Context
              </span>
              <span class="text-xs text-slate-400 font-medium">Space to flip back ␣</span>
            </div>

            <div class="my-auto py-3 space-y-3.5">
              <div>
                <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider">Formal Definition</h4>
                <p class="text-base sm:text-lg text-slate-100 font-medium leading-relaxed mt-1">${currentCard.definition}</p>
              </div>
              
              ${currentCard.example ? `
                <div class="p-3 bg-white/10 rounded-xl border border-white/10">
                  <h5 class="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Real-World Application</h5>
                  <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${currentCard.example}</p>
                </div>
              ` : ''}
            </div>

            <div class="pt-3 border-t border-white/15" onclick="event.stopPropagation();">
              <div class="flex items-center justify-between text-[11px] text-slate-300 mb-2 font-medium">
                <span>Rate your recall for Spaced Repetition:</span>
                <span class="text-xs text-indigo-300 font-semibold">${srsData.reviewCount > 0 ? `Interval: ${srsData.intervalDays}d` : 'First Review'}</span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button id="srs-btn-hard" class="py-2 px-1 rounded-xl bg-rose-600/90 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer shadow">
                  <span>Hard</span>
                  <span class="text-[9px] text-rose-200 font-normal">Re-queue today</span>
                </button>
                <button id="srs-btn-good" class="py-2 px-1 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 active:scale-95 text-white text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer shadow">
                  <span>Good</span>
                  <span class="text-[9px] text-indigo-200 font-normal">Review in 3d</span>
                </button>
                <button id="srs-btn-easy" class="py-2 px-1 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer shadow">
                  <span>Easy</span>
                  <span class="text-[9px] text-emerald-200 font-normal">Review in 7d</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      wrapper.appendChild(cardScene);

      const controls = document.createElement("div");
      controls.className = "flex items-center justify-between gap-3 pt-2";
      controls.innerHTML = `
        <div class="flex items-center gap-2">
          <button id="btn-card-prev" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${state.flashcard.index === 0 ? 'opacity-40 cursor-not-allowed' : ''}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            <span>Prev</span>
          </button>
          <button id="btn-card-flip" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Flip Card</span>
          </button>
          <button id="btn-card-next" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${state.flashcard.index === cards.length - 1 ? 'opacity-40 cursor-not-allowed' : ''}">
            <span>Next</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <div class="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
          Shortcut: <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">Space</kbd> Flip &bull; <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">&larr;</kbd> &bull; <kbd class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">&rarr;</kbd>
        </div>
      `;
      wrapper.appendChild(controls);

      const flipCard = () => {
        state.flashcard.isFlipped = !state.flashcard.isFlipped;
        const inner = document.getElementById("flashcard-inner");
        if (inner) {
          inner.classList.toggle("is-flipped", state.flashcard.isFlipped);
        }
      };

      document.getElementById("flashcard-scene")?.addEventListener("click", flipCard);
      document.getElementById("btn-card-flip")?.addEventListener("click", (e) => {
        e.stopPropagation();
        flipCard();
      });

      document.getElementById("btn-card-prev")?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.flashcard.index > 0) {
          state.flashcard.index--;
          state.flashcard.isFlipped = false;
          renderFlashcardsView(mod);
        }
      });

      document.getElementById("btn-card-next")?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.flashcard.index < cards.length - 1) {
          state.flashcard.index++;
          state.flashcard.isFlipped = false;
          renderFlashcardsView(mod);
        }
      });

    } else {
      // MODE 2: Active Recall / Cloze Study Mode
      const recallBox = document.createElement("div");
      recallBox.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5";

      recallBox.innerHTML = `
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-full">
            Active Recall Self-Test
          </span>
          <span class="text-xs text-slate-400">Card ${state.flashcard.index + 1} of ${cards.length}</span>
        </div>

        <div class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Concept / Term</span>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white">${currentCard.term}</h3>
          ${currentCard.hint ? `<p class="text-xs text-slate-500 italic">💡 Hint: ${currentCard.hint}</p>` : ''}
        </div>

        <div class="space-y-3">
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            Define this concept in your own words, or recall its key psychological mechanism:
          </label>
          <textarea 
            id="recall-input" 
            rows="3" 
            placeholder="Type your explanation here before checking..." 
            class="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed text-slate-900 dark:text-white"></textarea>
        </div>

        <div class="flex items-center gap-2">
          <button id="btn-reveal-recall" class="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer">
            Check Definition & Context 🔍
          </button>
        </div>

        <div id="recall-solution" class="hidden p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div>
            <h5 class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Formal Definition:</h5>
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1 leading-relaxed">${currentCard.definition}</p>
          </div>
          ${currentCard.example ? `
            <div class="pt-2 border-t border-slate-200 dark:border-slate-700">
              <h5 class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Application:</h5>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">${currentCard.example}</p>
            </div>
          ` : ''}

          <div class="pt-3 border-t border-slate-200 dark:border-slate-700">
            <span class="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">How did you do?</span>
            <div class="grid grid-cols-3 gap-2">
              <button id="recall-btn-missed" class="py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer">✕ Missed It</button>
              <button id="recall-btn-good" class="py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer">✓ Good Recall</button>
              <button id="recall-btn-nailed" class="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer">⭐ Nailed It!</button>
            </div>
          </div>
        </div>
      `;

      wrapper.appendChild(recallBox);

      const revealBtn = document.getElementById("btn-reveal-recall");
      const sol = document.getElementById("recall-solution");
      revealBtn?.addEventListener("click", () => {
        sol?.classList.remove("hidden");
        revealBtn?.classList.add("hidden");
      });

      const scheduleSRS = (ease, days) => {
        const cardId = currentCard.id;
        const prev = state.srsCards[cardId] || { reviewCount: 0 };
        state.srsCards[cardId] = {
          ease: ease,
          reviewCount: (prev.reviewCount || 0) + 1,
          lastReviewed: Date.now(),
          nextReviewDate: Date.now() + days * 24 * 60 * 60 * 1000,
          intervalDays: days
        };
        persistSRS();
        setModuleStepComplete(mod.id, "flashcards");
        if (state.flashcard.index < cards.length - 1) {
          state.flashcard.index++;
        }
        renderFlashcardsView(mod);
      };

      document.getElementById("recall-btn-missed")?.addEventListener("click", () => scheduleSRS("hard", 0));
      document.getElementById("recall-btn-good")?.addEventListener("click", () => scheduleSRS("good", 3));
      document.getElementById("recall-btn-nailed")?.addEventListener("click", () => scheduleSRS("easy", 7));
    }

    // Step 3 -> Next Step recommendation: Step 4 Case Study
    const bottomNav = document.createElement("div");
    bottomNav.className = "flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border border-amber-200 dark:border-rose-900/60 rounded-2xl shadow-sm mt-8";
    bottomNav.innerHTML = `
      <div>
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Step 3 &bull; Active Recall</span>
          <span>&bull;</span>
          <span>Next: Clinical Case Study (Step 4)</span>
        </div>
        <h4 class="font-extrabold text-slate-900 dark:text-white text-base mt-1">Ready to apply these concepts?</h4>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Solve realistic human dilemmas and see how theoretical principles apply to behavior.</p>
      </div>
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button id="btn-goto-casestudy-from-fc" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span>Next: Case Study (Step 4)</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    `;
    wrapper.appendChild(bottomNav);

    DOM.tabContent.appendChild(wrapper);

    document.getElementById("btn-goto-casestudy-from-fc")?.addEventListener("click", () => switchTab("case-study"));

    document.getElementById("btn-listen-card")?.addEventListener("click", function () {
      speakText(`${currentCard.term}. ${currentCard.definition}. For example: ${currentCard.example || ''}`, this);
    });

    const handleRating = (ease, days, msg) => {
      const cardId = currentCard.id;
      const prev = state.srsCards[cardId] || { reviewCount: 0 };
      state.srsCards[cardId] = {
        ease: ease,
        reviewCount: (prev.reviewCount || 0) + 1,
        lastReviewed: Date.now(),
        nextReviewDate: Date.now() + days * 24 * 60 * 60 * 1000,
        intervalDays: days
      };
      persistSRS();
      setModuleStepComplete(mod.id, "flashcards");
      if (ease === "hard") {
        state.flashcard.shuffledCards.push({ ...currentCard });
      }
      showToast(msg, ease === "hard" ? "warning" : ease === "good" ? "info" : "success");
      if (state.flashcard.index < state.flashcard.shuffledCards.length - 1) {
        state.flashcard.index++;
      }
      state.flashcard.isFlipped = false;
      renderFlashcardsView(mod);
    };

    document.getElementById("srs-btn-hard")?.addEventListener("click", (e) => {
      e.stopPropagation();
      handleRating("hard", 0, `"${currentCard.term}" marked Hard: Re-queued! 🔁`);
    });

    document.getElementById("srs-btn-good")?.addEventListener("click", (e) => {
      e.stopPropagation();
      handleRating("good", 3, `"${currentCard.term}" scheduled for review in 3 days 📅`);
    });

    document.getElementById("srs-btn-easy")?.addEventListener("click", (e) => {
      e.stopPropagation();
      handleRating("easy", 7, `Mastered "${currentCard.term}"! Next review in 7 days ⭐`);
    });

    document.getElementById("btn-shuffle-cards")?.addEventListener("click", () => {
      const arr = [...state.flashcard.shuffledCards];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      state.flashcard.shuffledCards = arr;
      state.flashcard.index = 0;
      state.flashcard.isFlipped = false;
      renderFlashcardsView(mod);
      showToast("Deck shuffled 🔀");
    });

    document.getElementById("mode-flip")?.addEventListener("click", () => {
      state.flashcard.mode = "flip";
      renderFlashcardsView(mod);
    });
    document.getElementById("mode-recall")?.addEventListener("click", () => {
      state.flashcard.mode = "recall";
      renderFlashcardsView(mod);
    });

    hookFlashcardFilters(mod);
  }

  function hookFlashcardFilters(mod) {
    document.getElementById("filter-all")?.addEventListener("click", () => {
      state.flashcard.filter = "all";
      state.flashcard.index = 0;
      state.flashcard.isFlipped = false;
      renderFlashcardsView(mod);
    });
    document.getElementById("filter-due")?.addEventListener("click", () => {
      state.flashcard.filter = "due";
      state.flashcard.index = 0;
      state.flashcard.isFlipped = false;
      renderFlashcardsView(mod);
    });
    document.getElementById("filter-mastered")?.addEventListener("click", () => {
      state.flashcard.filter = "mastered";
      state.flashcard.index = 0;
      state.flashcard.isFlipped = false;
      renderFlashcardsView(mod);
    });
  }

  // 3. Interactive Case Studies View
  function renderCaseStudyView(mod) {
    const container = document.createElement("div");
    container.className = "space-y-6 max-w-3xl mx-auto";

    if (!mod.caseStudies || mod.caseStudies.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-500">No case study available for this module.</div>`;
      DOM.tabContent.appendChild(container);
      return;
    }

    const cs = mod.caseStudies[0];
    const userSelectedIdx = state.caseStudyAnswers[cs.id];
    const isAnswered = userSelectedIdx !== undefined;
    const isRevealed = state.caseStudyRevealed[cs.id] || false;

    const headerCard = document.createElement("div");
    headerCard.className = "bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2";
    headerCard.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full">
          Clinical & Applied Behavioral Dilemma
        </span>
        <span class="text-xs text-slate-500 dark:text-slate-400 font-semibold">${cs.persona}</span>
      </div>
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">${cs.title}</h2>
    `;
    container.appendChild(headerCard);

    const scenarioCard = document.createElement("div");
    scenarioCard.className = "bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4";
    scenarioCard.innerHTML = `
      <div class="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          The Scenario
        </h3>
        <p>${cs.scenario}</p>
      </div>

      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
        <h4 class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
          <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          The Core Dilemma
        </h4>
        <p class="whitespace-pre-line leading-relaxed">${cs.dilemma}</p>
      </div>
    `;
    container.appendChild(scenarioCard);

    const questionCard = document.createElement("div");
    questionCard.className = "bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4";
    questionCard.innerHTML = `
      <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
        <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">Psychological Analysis Challenge</span>
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">${cs.question}</h3>
      </div>

      <div class="space-y-2.5 pt-1" id="cs-options-group">
        ${cs.options.map((opt, oIdx) => {
          let extraClass = "";
          let iconHtml = `<div class="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0"></div>`;

          if (isAnswered) {
            if (opt.correct) {
              extraClass = "correct-choice font-bold";
              iconHtml = `<svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
            } else if (userSelectedIdx === oIdx && !opt.correct) {
              extraClass = "incorrect-choice font-semibold line-through";
              iconHtml = `<svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>`;
            } else {
              extraClass = "opacity-40";
            }
          }

          return `
            <button 
              type="button" 
              data-cs-oidx="${oIdx}" 
              class="quiz-option w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm flex items-center justify-between gap-3 cursor-pointer ${extraClass}">
              <span class="text-slate-800 dark:text-slate-200 leading-relaxed">${opt.text}</span>
              ${iconHtml}
            </button>
          `;
        }).join("")}
      </div>

      ${isAnswered ? `
        <div class="mt-4 p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
          cs.options[userSelectedIdx].correct 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
        }">
          <span class="font-bold block mb-1">
            ${cs.options[userSelectedIdx].correct ? '✓ Correct Assessment!' : '✕ Diagnostic Feedback:'}
          </span>
          <p>${cs.options[userSelectedIdx].rationale}</p>
        </div>
      ` : ''}
    `;
    container.appendChild(questionCard);

    const breakdownCard = document.createElement("div");
    breakdownCard.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4";
    breakdownCard.innerHTML = `
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span>🧠</span>
          <span>Theoretical Perspectives Breakdown</span>
        </h4>
        <button id="btn-toggle-breakdown" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
          ${isRevealed ? 'Hide Analysis' : 'Reveal Expert Breakdown'}
        </button>
      </div>

      <div id="breakdown-content" class="${isRevealed ? '' : 'hidden'} pt-2 space-y-4 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800">
        <p class="text-slate-700 dark:text-slate-300">${cs.explanation}</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div class="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <h5 class="font-bold text-indigo-900 dark:text-indigo-300 text-xs mb-1">Biological / Neural</h5>
            <p class="text-[11px] sm:text-xs text-indigo-950/80 dark:text-indigo-200/80">${cs.perspectives?.biological || "Neurochemical pathways and sympathetic arousal."}</p>
          </div>
          <div class="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
            <h5 class="font-bold text-purple-900 dark:text-purple-300 text-xs mb-1">Cognitive / Behavioral</h5>
            <p class="text-[11px] sm:text-xs text-purple-950/80 dark:text-purple-200/80">${cs.perspectives?.cognitive || "Schemas, internal attribution, and classical conditioning."}</p>
          </div>
          <div class="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
            <h5 class="font-bold text-emerald-900 dark:text-emerald-300 text-xs mb-1">Socio-Cultural</h5>
            <p class="text-[11px] sm:text-xs text-emerald-950/80 dark:text-emerald-200/80">${cs.perspectives?.sociocultural || "Normative social influence, environmental conditioning."}</p>
          </div>
        </div>
      </div>
    `;
    container.appendChild(breakdownCard);

    // Step 4 -> Next Step recommendation: Step 5 Practice Quiz
    const bottomNav = document.createElement("div");
    bottomNav.className = "flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-rose-500/10 via-emerald-500/10 to-teal-500/10 border border-rose-200 dark:border-emerald-900/60 rounded-2xl shadow-sm";
    bottomNav.innerHTML = `
      <div>
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Step 4 &bull; Clinical Case Study</span>
          <span>&bull;</span>
          <span>Final Step: Practice Quiz</span>
        </div>
        <h4 class="font-extrabold text-slate-900 dark:text-white text-base mt-1">Ready to prove your comprehension?</h4>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Take the 5-question module quiz to earn your verified mastery badge.</p>
      </div>
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button id="btn-goto-quiz-from-cs" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span>Next: Practice Quiz (Step 5)</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    `;
    container.appendChild(bottomNav);

    DOM.tabContent.appendChild(container);

    document.getElementById("btn-goto-quiz-from-cs")?.addEventListener("click", () => switchTab("quiz"));

    if (!isAnswered) {
      questionCard.querySelectorAll("[data-cs-oidx]").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-cs-oidx"), 10);
          state.caseStudyAnswers[cs.id] = idx;
          state.caseStudyRevealed[cs.id] = true;
          persistSRS();
          setModuleStepComplete(mod.id, "caseStudy");
          renderCaseStudyView(mod);
          if (cs.options[idx].correct) {
            playSoftChime(880, 0.8);
            showToast("Accurate Case Study Diagnosis! 🎯", "success");
          } else {
            playSoftChime(330, 0.5);
          }
        });
      });
    }

    document.getElementById("btn-toggle-breakdown")?.addEventListener("click", () => {
      state.caseStudyRevealed[cs.id] = !state.caseStudyRevealed[cs.id];
      setModuleStepComplete(mod.id, "caseStudy");
      renderCaseStudyView(mod);
    });
  }

  // 4. Practice Quiz View
  function renderQuizView(mod) {
    const container = document.createElement("div");
    container.className = "space-y-6 max-w-2xl mx-auto";

    const quizLength = mod.quiz.length;
    const answeredCount = Object.keys(state.quiz.answers).length;
    const isSubmitted = state.quiz.submitted;

    const quizHeader = document.createElement("div");
    quizHeader.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm";

    if (!isSubmitted) {
      quizHeader.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-full">
            Knowledge Check
          </span>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
            ${answeredCount} of ${quizLength} answered
          </span>
        </div>
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">${mod.title} Mastery Quiz</h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Select your answers below. Explanations unlock upon submission.</p>
      `;
    } else {
      const pct = Math.round((state.quiz.score / quizLength) * 100);
      const passed = pct >= 80;
      quizHeader.innerHTML = `
        <div class="text-center space-y-3 py-3">
          <div class="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${
            passed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          }">
            ${passed ? "✓" : "!"}
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">
            ${passed ? "Module Mastered!" : "Good Attempt!"}
          </h2>
          <div class="text-3xl font-extrabold ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}">
            ${state.quiz.score} / ${quizLength} (${pct}%)
          </div>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            ${passed ? "Great comprehension of the foundational theories and empirical evidence!" : "Review the question breakdowns below, re-read challenging sections, and retake the quiz."}
          </p>
          <div class="pt-2">
            <button id="btn-retake-quiz" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm">
              Retake Practice Quiz 🔁
            </button>
          </div>
        </div>
      `;
    }

    container.appendChild(quizHeader);

    mod.quiz.forEach((q, qIdx) => {
      const qCard = document.createElement("div");
      qCard.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4";

      const selectedOptionIdx = state.quiz.answers[q.id];
      const isAnswered = selectedOptionIdx !== undefined;

      let questionStatus = "";
      if (isSubmitted) {
        const isCorrect = selectedOptionIdx === q.correctIndex;
        questionStatus = isCorrect 
          ? `<span class="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">✓ Correct</span>`
          : `<span class="text-xs bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">✕ Incorrect</span>`;
      }

      qCard.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Question ${qIdx + 1}</span>
          ${questionStatus}
        </div>
        <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">${q.question}</h3>
        
        <div class="space-y-2 pt-1" id="quiz-options-${q.id}">
          ${q.options.map((opt, oIdx) => {
            let optionClass = "";
            let indicator = `<div class="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0"></div>`;

            if (!isSubmitted) {
              if (selectedOptionIdx === oIdx) {
                optionClass = "selected font-semibold";
                indicator = `<div class="w-3.5 h-3.5 rounded-full border-4 border-indigo-600 flex-shrink-0"></div>`;
              }
            } else {
              if (oIdx === q.correctIndex) {
                optionClass = "correct-choice font-bold";
                indicator = `<svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
              } else if (selectedOptionIdx === oIdx && oIdx !== q.correctIndex) {
                optionClass = "incorrect-choice font-semibold line-through";
                indicator = `<svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
              } else {
                optionClass = "opacity-50 disabled";
              }
            }

            return `
              <button 
                type="button" 
                data-qid="${q.id}" 
                data-oidx="${oIdx}" 
                ${isSubmitted ? "disabled" : ""}
                class="quiz-option w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm flex items-center justify-between gap-3 ${optionClass} cursor-pointer">
                <span class="text-slate-800 dark:text-slate-200">${opt}</span>
                ${indicator}
              </button>
            `;
          }).join("")}
        </div>

        ${isSubmitted ? `
          <div class="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <span class="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Explanation:</span>
            ${q.explanation}
          </div>
        ` : ""}
      `;

      container.appendChild(qCard);
    });

    if (!isSubmitted) {
      const submitBox = document.createElement("div");
      submitBox.className = "p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm";
      submitBox.innerHTML = `
        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          ${answeredCount === quizLength ? "✓ All questions answered. Ready to submit!" : `${quizLength - answeredCount} question(s) remaining`}
        </span>
        <button 
          id="btn-submit-quiz" 
          ${answeredCount === 0 ? "disabled" : ""} 
          class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer">
          Submit Answers
        </button>
      `;
      container.appendChild(submitBox);
    } else {
      const curModIdx = PSYCH_DATA.modules.findIndex(m => m.id === mod.id);
      const nextMod = curModIdx >= 0 && curModIdx < PSYCH_DATA.modules.length - 1 ? PSYCH_DATA.modules[curModIdx + 1] : null;
      const passed = state.quiz.score >= 3;

      const completionCard = document.createElement("div");
      completionCard.className = `p-6 rounded-2xl border shadow-sm transition-all flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${
        passed 
          ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-emerald-300 dark:border-emerald-800" 
          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
      }`;

      if (passed) {
        if (nextMod) {
          completionCard.innerHTML = `
            <div>
              <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span>🎉 Module ${mod.number} Mastered!</span>
                <span>&bull;</span>
                <span>Ready for Next Module</span>
              </div>
              <h4 class="font-extrabold text-slate-900 dark:text-white text-base mt-1">Next: Module ${nextMod.number} - ${nextMod.title}</h4>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">${nextMod.tagline}</p>
            </div>
            <div class="flex items-center gap-2.5 w-full sm:w-auto">
              <button id="btn-advance-next-module" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>Advance to Module ${nextMod.number}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          `;
        } else {
          // Module 8 capstone!
          completionCard.innerHTML = `
            <div>
              <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span>🎓 Curriculum Complete!</span>
                <span>&bull;</span>
                <span>All 8 Modules Mastered</span>
              </div>
              <h4 class="font-extrabold text-slate-900 dark:text-white text-base mt-1">Ready for the 40-Question Mock Final Exam?</h4>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Test your comprehensive knowledge across all 8 modules in a timed 30-minute simulation.</p>
            </div>
            <div class="flex items-center gap-2.5 w-full sm:w-auto">
              <button id="btn-advance-mockexam" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>Launch Mock Final Exam</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          `;
        }
      } else {
        completionCard.innerHTML = `
          <div>
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <span>Need 3+ to Pass</span>
              <span>&bull;</span>
              <span>Keep Practicing</span>
            </div>
            <h4 class="font-extrabold text-slate-900 dark:text-white text-base mt-1">Review Active Recall Cards before moving on</h4>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Targeted flashcard practice will reinforce the specific facts you missed.</p>
          </div>
          <div class="flex items-center gap-2.5 w-full sm:w-auto">
            <button id="btn-review-cards-retry" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span>Review Cards</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        `;
      }

      container.appendChild(completionCard);
    }

    DOM.tabContent.appendChild(container);

    if (!isSubmitted) {
      container.querySelectorAll(".quiz-option").forEach(btn => {
        btn.addEventListener("click", () => {
          const qId = btn.getAttribute("data-qid");
          const oIdx = parseInt(btn.getAttribute("data-oidx"), 10);
          state.quiz.answers[qId] = oIdx;
          renderQuizView(mod);
        });
      });

      document.getElementById("btn-submit-quiz")?.addEventListener("click", () => {
        let score = 0;
        mod.quiz.forEach(q => {
          if (state.quiz.answers[q.id] === q.correctIndex) {
            score++;
          }
        });
        state.quiz.score = score;
        state.quiz.submitted = true;

        const prev = state.userProgress.completedQuizzes[mod.id] || 0;
        if (score >= prev) {
          state.userProgress.completedQuizzes[mod.id] = score;
        }
        setModuleStepComplete(mod.id, "quiz");
        persistSRS();
        renderSidebar();
        renderQuizView(mod);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (score === quizLength) {
          showToast("🏆 Perfect score on Module Quiz!", "success");
        }
      });
    } else {
      const curModIdx = PSYCH_DATA.modules.findIndex(m => m.id === mod.id);
      const nextMod = curModIdx >= 0 && curModIdx < PSYCH_DATA.modules.length - 1 ? PSYCH_DATA.modules[curModIdx + 1] : null;

      document.getElementById("btn-advance-next-module")?.addEventListener("click", () => {
        if (nextMod) switchModule(nextMod.id);
      });
      document.getElementById("btn-advance-mockexam")?.addEventListener("click", () => {
        openMockExam();
      });
      document.getElementById("btn-review-cards-retry")?.addEventListener("click", () => {
        switchTab("flashcards");
      });

      document.getElementById("btn-retake-quiz")?.addEventListener("click", () => {
        state.quiz.answers = {};
        state.quiz.submitted = false;
        state.quiz.score = 0;
        renderQuizView(mod);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  // 5. Curated Media View
  function renderResourcesView(mod) {
    setModuleStepComplete(mod.id, "video");
    const container = document.createElement("div");
    container.className = "space-y-6 max-w-3xl mx-auto";

    const banner = document.createElement("div");
    banner.className = "bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm";
    banner.innerHTML = `
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Curated Educational Video Lectures</h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        High-yield video summaries from CrashCourse Psychology and reputable science educators to solidify visual and auditory comprehension of ${mod.title}.
      </p>
    `;
    container.appendChild(banner);

    const videoGrid = document.createElement("div");
    videoGrid.className = "grid grid-cols-1 gap-4";

    mod.videos.forEach((vid) => {
      const card = document.createElement("a");
      card.href = vid.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.className = "block bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow hover:border-indigo-300 group cursor-pointer";
      
      card.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">${vid.channel} &bull; ${vid.duration}</span>
              <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Watch on YouTube 
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </span>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-1">${vid.title}</h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">${vid.summary}</p>
          </div>
        </div>
      `;
      videoGrid.appendChild(card);
    });

    container.appendChild(videoGrid);

    const tipsCard = document.createElement("div");
    tipsCard.className = "bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-5 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 space-y-2";
    tipsCard.innerHTML = `
      <h4 class="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
        <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Evidence-Based Study Strategy: Multi-Modal Encoding
      </h4>
      <p class="leading-relaxed">
        Dual-Coding Theory (Paivio, 1971) proves that pairing auditory explanations with concrete visual animations creates two independent cognitive memory traces in long-term memory. Watching these curated CrashCourse episodes after reading the study guide dramatically boosts retention on the Mock Final Exam.
      </p>
    `;
    container.appendChild(tipsCard);

    // Step 2 -> Next Step recommendation: Step 3 Active Recall Flashcards
    const bottomNav = document.createElement("div");
    bottomNav.className = "flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200 dark:border-indigo-900/60 rounded-2xl shadow-sm";
    bottomNav.innerHTML = `
      <div>
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Step 2 Complete</span>
          <span>&bull;</span>
          <span>Next: Active Recall Flashcards (Step 3)</span>
        </div>
        <h4 class="font-extrabold text-slate-900 dark:text-white text-base mt-1">Ready for Active Retrieval?</h4>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Retrieval effort strengthens neural pathways far more than passive re-watching.</p>
      </div>
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button id="btn-goto-flashcards-from-media" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span>Next: Practice Cards (Step 3)</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    `;
    container.appendChild(bottomNav);

    DOM.tabContent.appendChild(container);

    document.getElementById("btn-goto-flashcards-from-media")?.addEventListener("click", () => switchTab("flashcards"));
  }

  // Global Quick Search Feature
  function setupSearch() {
    if (!DOM.searchInput || !DOM.searchResults) return;

    DOM.searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) {
        DOM.searchResults.classList.add("hidden");
        DOM.searchResults.innerHTML = "";
        return;
      }

      const results = [];

      PSYCH_DATA.modules.forEach(mod => {
        mod.sections.forEach(sec => {
          if (sec.title.toLowerCase().includes(query) || sec.content.toLowerCase().includes(query)) {
            results.push({
              type: "Topic",
              moduleId: mod.id,
              moduleTitle: mod.title,
              title: sec.title,
              snippet: sec.analogy ? `Analogy: ${sec.analogy.metaphor}` : `Section in ${mod.title}`,
              tab: "study"
            });
          }
        });

        mod.flashcards.forEach(fc => {
          if (fc.term.toLowerCase().includes(query) || fc.definition.toLowerCase().includes(query)) {
            results.push({
              type: "Flashcard",
              moduleId: mod.id,
              moduleTitle: mod.title,
              title: fc.term,
              snippet: fc.definition.slice(0, 80) + "...",
              tab: "flashcards"
            });
          }
        });

        if (mod.caseStudies) {
          mod.caseStudies.forEach(cs => {
            if (cs.title.toLowerCase().includes(query) || cs.scenario.toLowerCase().includes(query) || cs.persona.toLowerCase().includes(query)) {
              results.push({
                type: "Case Study",
                moduleId: mod.id,
                moduleTitle: mod.title,
                title: cs.title,
                snippet: `${cs.persona} &bull; Dilemma`,
                tab: "case-study"
              });
            }
          });
        }
      });

      if (results.length === 0) {
        DOM.searchResults.innerHTML = `<div class="p-4 text-center text-xs text-slate-500 dark:text-slate-400">No matching concepts found for "${query}"</div>`;
      } else {
        DOM.searchResults.innerHTML = results.slice(0, 6).map((res, i) => `
          <button 
            type="button" 
            data-search-idx="${i}" 
            class="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-2.5 transition-colors cursor-pointer">
            <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              res.type === 'Flashcard' 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                : res.type === 'Case Study'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
            } flex-shrink-0 mt-0.5">${res.type}</span>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-slate-800 dark:text-white truncate">${res.title}</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">${res.snippet} &bull; <span class="text-indigo-600 dark:text-indigo-400 font-medium">${res.moduleTitle}</span></div>
            </div>
          </button>
        `).join("");

        results.slice(0, 6).forEach((res, i) => {
          const btn = DOM.searchResults.querySelector(`[data-search-idx="${i}"]`);
          btn?.addEventListener("click", () => {
            state.currentModuleId = res.moduleId;
            state.currentTab = res.tab;
            DOM.searchResults.classList.add("hidden");
            DOM.searchInput.value = "";
            renderSidebar();
            renderCurrentView();
          });
        });
      }

      DOM.searchResults.classList.remove("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!DOM.searchInput.contains(e.target) && !DOM.searchResults.contains(e.target)) {
        DOM.searchResults.classList.add("hidden");
      }
    });
  }

  // Keyboard navigation for flashcards
  function setupKeyboardNav() {
    window.addEventListener("keydown", (e) => {
      if (state.currentTab !== "flashcards") return;
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;

      const cards = getFilteredFlashcards();
      const mod = getCurrentModule();

      if (e.code === "Space") {
        e.preventDefault();
        state.flashcard.isFlipped = !state.flashcard.isFlipped;
        const inner = document.getElementById("flashcard-inner");
        if (inner) {
          inner.classList.toggle("is-flipped", state.flashcard.isFlipped);
        }
      } else if (e.code === "ArrowRight") {
        if (state.flashcard.index < cards.length - 1) {
          state.flashcard.index++;
          state.flashcard.isFlipped = false;
          renderFlashcardsView(mod);
        }
      } else if (e.code === "ArrowLeft") {
        if (state.flashcard.index > 0) {
          state.flashcard.index--;
          state.flashcard.isFlipped = false;
          renderFlashcardsView(mod);
        }
      }
    });
  }

  // Mobile Menu Drawer Control
  function openMobileMenu() {
    state.isMobileMenuOpen = true;
    DOM.mobileMenu?.classList.remove("hidden");
    DOM.mobileMenuBackdrop?.classList.remove("hidden");
  }

  function closeMobileMenu() {
    state.isMobileMenuOpen = false;
    DOM.mobileMenu?.classList.add("hidden");
    DOM.mobileMenuBackdrop?.classList.add("hidden");
  }

  // Setup Event Listeners
  function setupEventListeners() {
    setupSearch();
    setupKeyboardNav();

    DOM.btnOpenMenu?.addEventListener("click", openMobileMenu);
    DOM.btnCloseMenu?.addEventListener("click", closeMobileMenu);
    DOM.mobileMenuBackdrop?.addEventListener("click", closeMobileMenu);
  }

  // Run on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
