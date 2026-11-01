/**
 * Psychology 101 Interactive Study App - Upgraded Core Application Logic
 * Featuring:
 * 1. Spaced Repetition System (SRS) for Flashcards (localStorage persistence, ease ratings, intervals)
 * 2. Interactive Case Studies with realistic dilemmas and comparative theoretical breakdowns
 * 3. 25-Min Minimalist Pomodoro Focus Timer with Web Audio API chime
 * 4. Persistent Collapsible Notes Scratchpad (auto-saving per module, export, word counts)
 * 5. Dark / Light mode theme management respecting system preferences
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

    // Notes Scratchpad Elements
    btnToggleScratchpad: document.getElementById("btn-toggle-scratchpad"),
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
    btnCloseScratchpad: document.getElementById("btn-close-scratchpad")
  };

  // Initialize App
  function init() {
    initTheme();
    initPomodoro();
    initScratchpad();
    renderSidebar();
    resetFlashcardsForCurrentModule();
    renderCurrentView();
    setupEventListeners();
    updateStatsBadges();
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
      icon = `<svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === "warning") {
      icon = `<svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    }

    toast.innerHTML = `${icon} <span class="flex-1">${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-8px) scale(0.95)";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // Web Audio API Soft Chime
  function playSoftChime(frequency = 528, duration = 1.4) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      // Soothing harmonic frequency
      osc1.frequency.setValueAtTime(frequency, now);
      osc1.frequency.exponentialRampToValueAtTime(frequency * 1.25, now + 0.12);
      osc2.frequency.setValueAtTime(frequency * 2, now);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn("Web Audio API chime error:", e);
    }
  }

  // 1. Dark / Light Theme Engine
  function initTheme() {
    const isDark = document.documentElement.classList.contains("dark");
    updateThemeIcons(isDark);

    const toggle = () => {
      const willBeDark = !document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark", willBeDark);
      localStorage.setItem("psych_theme", willBeDark ? "dark" : "light");
      updateThemeIcons(willBeDark);
      showToast(willBeDark ? "Dark theme enabled 🌙" : "Light theme enabled ☀️");
    };

    DOM.btnThemeToggle?.addEventListener("click", toggle);
    DOM.btnThemeToggleMobile?.addEventListener("click", toggle);

    // Watch system changes if user hasn't explicitly set preference
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("psych_theme")) {
        document.documentElement.classList.toggle("dark", e.matches);
        updateThemeIcons(e.matches);
      }
    });
  }

  function updateThemeIcons(isDark) {
    // Icons toggle automatically via Tailwind's `hidden dark:block` and `block dark:hidden`
  }

  // 2. Pomodoro Focus Timer Engine
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
        // Timer reached 00:00!
        pausePomodoro();
        playSoftChime(660, 2.0);

        if (state.pomodoro.mode === "focus") {
          showToast("🎉 25-minute focus sprint complete! Enjoy a relaxing 5-minute break.", "success");
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

  // Update Global Stats in Sidebar
  function updateStatsBadges() {
    const totalCards = PSYCH_DATA.modules.reduce((acc, m) => acc + m.flashcards.length, 0);
    
    // Count SRS Mastered cards (ease is 'easy' or intervalDays >= 7)
    let srsMasteredCount = 0;
    Object.values(state.srsCards).forEach(cardState => {
      if (cardState.ease === "easy" || cardState.intervalDays >= 7) {
        srsMasteredCount++;
      }
    });

    const completedQuizzesCount = Object.keys(state.userProgress.completedQuizzes).length;
    const totalQuizzes = PSYCH_DATA.modules.length;

    if (DOM.totalMasteredBadge) {
      DOM.totalMasteredBadge.textContent = `${srsMasteredCount} / ${totalCards} Terms`;
    }

    // Overall progress: 50% SRS flashcard mastery, 50% quiz completion
    const cardPct = totalCards ? (srsMasteredCount / totalCards) * 50 : 0;
    const quizPct = totalQuizzes ? (completedQuizzesCount / totalQuizzes) * 50 : 0;
    const totalPct = Math.min(100, Math.round(cardPct + quizPct));

    if (DOM.overallProgressFill) {
      DOM.overallProgressFill.style.width = `${totalPct}%`;
    }
    if (DOM.overallProgressPct) {
      DOM.overallProgressPct.textContent = `${totalPct}% Complete`;
    }
  }

  // Render Sidebar Module Lists
  function renderSidebar() {
    const renderItems = (container) => {
      if (!container) return;
      container.innerHTML = "";

      PSYCH_DATA.modules.forEach(mod => {
        const isActive = mod.id === state.currentModuleId;
        const isQuizPassed = state.userProgress.completedQuizzes[mod.id] !== undefined;

        const btn = document.createElement("button");
        btn.className = `w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group ${
          isActive 
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }`;
        
        btn.innerHTML = `
          <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
            isActive 
              ? "bg-white/20 text-white" 
              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
          }">
            ${mod.number}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <span class="text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-800 dark:text-slate-100"}">${mod.title}</span>
              ${isQuizPassed ? '<span class="text-xs bg-emerald-400 text-emerald-950 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">✓ Quiz</span>' : ''}
            </div>
            <p class="text-xs truncate ${isActive ? "text-indigo-100" : "text-slate-400 dark:text-slate-500"} mt-0.5">${mod.sections.length} core topics &bull; 1 Case Study</p>
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
    state.currentModuleId = moduleId;
    state.currentTab = "study"; // Reset to study guide
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
    state.currentTab = tabKey;
    if (tabKey === "flashcards") {
      state.flashcard.isFlipped = false;
    }
    renderHeaderAndTabs();
    renderTabContent();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Reset Flashcards for Current Module
  function resetFlashcardsForCurrentModule() {
    const mod = getCurrentModule();
    state.flashcard.index = 0;
    state.flashcard.isFlipped = false;
    state.flashcard.filter = "all";
    state.flashcard.shuffledCards = [...mod.flashcards];
  }

  // Filtered Flashcards (SRS Aware)
  function getFilteredFlashcards() {
    const cards = state.flashcard.shuffledCards;
    const now = Date.now();

    if (state.flashcard.filter === "due") {
      // Due if never reviewed, or nextReviewDate <= now
      return cards.filter(c => {
        const srs = state.srsCards[c.id];
        if (!srs) return true; // new card is due
        return srs.nextReviewDate <= now;
      });
    }
    if (state.flashcard.filter === "mastered") {
      // Mastered if ease === 'easy' or intervalDays >= 7
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
    renderTabContent();
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
            ${mod.flashcards.length} SRS Cards &bull; ${mod.quiz.length} Quiz Questions &bull; 1 Case Study
          </div>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">${mod.title}</h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">${mod.tagline}</p>
      `;
    }

    if (DOM.moduleTabs) {
      const tabs = [
        { key: "study", label: "Study Guide", icon: "book" },
        { key: "flashcards", label: `SRS Flashcards (${mod.flashcards.length})`, icon: "layers" },
        { key: "quiz", label: `Practice Quiz (${mod.quiz.length})`, icon: "check" },
        { key: "case-study", label: `Case Study (${mod.caseStudies ? mod.caseStudies.length : 1})`, icon: "puzzle" },
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
    const container = document.createElement("div");
    container.className = "space-y-8";

    // Executive Summary Banner
    const summaryBox = document.createElement("div");
    summaryBox.className = "bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-950 rounded-2xl p-6 shadow-sm";
    summaryBox.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div>
          <h2 class="text-xs font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Module Overview</h2>
          <p class="text-slate-700 dark:text-slate-300 leading-relaxed mt-1 text-sm sm:text-base">${mod.summary}</p>
        </div>
      </div>
    `;
    container.appendChild(summaryBox);

    // Render Each Section
    mod.sections.forEach((sec, idx) => {
      const secCard = document.createElement("article");
      secCard.className = "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 transition-colors";

      const formattedContent = sec.content
        .split("\n\n")
        .map(paragraph => {
          if (paragraph.startsWith("- ")) {
            const listItems = paragraph
              .split("\n")
              .map(item => `<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">${item.replace(/^- /, "")}</li>`)
              .join("");
            return `<ul class="space-y-1.5 my-3">${listItems}</ul>`;
          }
          if (paragraph.match(/^\d+\.\s/)) {
            const listItems = paragraph
              .split("\n")
              .map(item => `<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300">${item.replace(/^\d+\.\s/, "")}</li>`)
              .join("");
            return `<ol class="space-y-1.5 my-3">${listItems}</ol>`;
          }
          return `<p class="text-slate-700 dark:text-slate-300 leading-relaxed text-base">${paragraph}</p>`;
        })
        .join("")
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

      let analogyHtml = "";
      if (sec.analogy) {
        analogyHtml = `
          <div class="analogy-callout rounded-xl p-5 my-4">
            <div class="flex items-center gap-2 mb-2 text-indigo-900 dark:text-indigo-300 font-bold text-sm">
              <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              <span>Mental Analogy: ${sec.analogy.metaphor}</span>
            </div>
            <p class="text-sm text-indigo-950/90 dark:text-slate-200 leading-relaxed"><strong class="text-indigo-900 dark:text-indigo-300">Understanding ${sec.analogy.concept}:</strong> ${sec.analogy.explanation}</p>
          </div>
        `;
      }

      let critiqueHtml = "";
      if (sec.critique) {
        critiqueHtml = `
          <div class="bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded-r-xl p-4 text-xs sm:text-sm text-amber-950 dark:text-amber-200">
            <span class="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-1">Scientific Critique & Legacy:</span>
            ${sec.critique}
          </div>
        `;
      }

      let keyPointsHtml = "";
      if (sec.keyPoints && sec.keyPoints.length > 0) {
        keyPointsHtml = `
          <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mt-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              Key Takeaways
            </h4>
            <ul class="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              ${sec.keyPoints.map(kp => `<li class="flex items-start gap-2"><span class="text-emerald-500 font-bold">•</span><span>${kp}</span></li>`).join("")}
            </ul>
          </div>
        `;
      }

      secCard.innerHTML = `
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">${sec.title}</h3>
        </div>
        <div class="prose max-w-none text-slate-700 dark:text-slate-300">
          ${formattedContent}
        </div>
        ${analogyHtml}
        ${critiqueHtml}
        ${keyPointsHtml}
      `;

      container.appendChild(secCard);
    });

    // Next Action Bar at Bottom of Study Guide
    const bottomNav = document.createElement("div");
    bottomNav.className = "flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm";
    bottomNav.innerHTML = `
      <div>
        <h4 class="font-bold text-slate-900 dark:text-white text-base">Finished reading this module?</h4>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Lock in concepts with Spaced Repetition flashcards, solve the Case Study, or take the Quiz.</p>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button id="btn-goto-flashcards" class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span>Review Flashcards</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
        <button id="btn-goto-case-study" class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span>Case Study</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    `;

    container.appendChild(bottomNav);
    DOM.tabContent.appendChild(container);

    document.getElementById("btn-goto-flashcards")?.addEventListener("click", () => switchTab("flashcards"));
    document.getElementById("btn-goto-case-study")?.addEventListener("click", () => switchTab("case-study"));
  }

  // 2. Upgraded Spaced Repetition Flashcards View
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

    // Controls & Filter Header
    const topBar = document.createElement("div");
    topBar.className = "flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm";

    topBar.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SRS Deck:</span>
        <div class="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button id="filter-all" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${state.flashcard.filter === 'all' ? 'bg-white dark:bg-slate-700 shadow text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">All (${totalCardsInModule})</button>
          <button id="filter-due" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${state.flashcard.filter === 'due' ? 'bg-white dark:bg-slate-700 shadow text-rose-700 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">Due for Review (${dueCount})</button>
          <button id="filter-mastered" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${state.flashcard.filter === 'mastered' ? 'bg-white dark:bg-slate-700 shadow text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">Mastered (${masteredCount})</button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-shuffle-cards" title="Shuffle flashcards" class="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span class="hidden sm:inline">Shuffle</span>
        </button>
      </div>
    `;
    wrapper.appendChild(topBar);

    // Empty state if filtered list is empty
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
    const srsData = state.srsCards[currentCard.id] || {
      ease: "none",
      reviewCount: 0,
      intervalDays: 0,
      nextReviewDate: 0
    };

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

    // Card Progress Bar & Counter
    const progressHeader = document.createElement("div");
    progressHeader.className = "flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1";
    progressHeader.innerHTML = `
      <span>Card ${state.flashcard.index + 1} of ${cards.length}</span>
      <div class="flex items-center gap-2">
        ${srsStatusBadge}
      </div>
    `;
    wrapper.appendChild(progressHeader);

    // 3D Flip Card Container
    const cardScene = document.createElement("div");
    cardScene.className = "perspective-1000 w-full min-h-[380px] cursor-pointer select-none";
    cardScene.id = "flashcard-scene";

    cardScene.innerHTML = `
      <div id="flashcard-inner" class="flashcard-inner transform-style-3d relative w-full h-full min-h-[380px] rounded-3xl shadow-lg border border-slate-200/90 dark:border-slate-800 ${state.flashcard.isFlipped ? 'is-flipped' : ''}">
        
        <!-- FRONT OF CARD -->
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

        <!-- BACK OF CARD -->
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

          <!-- Spaced Repetition Rating Buttons on Flip -->
          <div class="pt-3 border-t border-white/15" onclick="event.stopPropagation();">
            <div class="flex items-center justify-between text-[11px] text-slate-300 mb-2 font-medium">
              <span>Rate your recall for Spaced Repetition:</span>
              <span class="text-xs text-indigo-300 font-semibold">${srsData.reviewCount > 0 ? `Interval: ${srsData.intervalDays}d` : 'First Review'}</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button 
                id="srs-btn-hard" 
                class="py-2 px-1 rounded-xl bg-rose-600/90 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer shadow">
                <span>Hard</span>
                <span class="text-[9px] text-rose-200 font-normal">Re-queue today</span>
              </button>
              <button 
                id="srs-btn-good" 
                class="py-2 px-1 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 active:scale-95 text-white text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer shadow">
                <span>Good</span>
                <span class="text-[9px] text-indigo-200 font-normal">Review in 3d</span>
              </button>
              <button 
                id="srs-btn-easy" 
                class="py-2 px-1 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer shadow">
                <span>Easy</span>
                <span class="text-[9px] text-emerald-200 font-normal">Review in 7d</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    wrapper.appendChild(cardScene);

    // Flashcard Bottom Navigation Controls
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

    DOM.tabContent.appendChild(wrapper);

    // Event hooks for flashcard
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

    // Spaced Repetition Rating Actions
    // Hard: Re-queue immediately in session
    document.getElementById("srs-btn-hard")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const cardId = currentCard.id;
      const prev = state.srsCards[cardId] || { reviewCount: 0 };
      state.srsCards[cardId] = {
        ease: "hard",
        reviewCount: (prev.reviewCount || 0) + 1,
        lastReviewed: Date.now(),
        nextReviewDate: Date.now(), // Due today
        intervalDays: 0
      };
      persistSRS();

      // Re-queue card to the end of the current session deck
      state.flashcard.shuffledCards.push({ ...currentCard });
      showToast(`"${currentCard.term}" marked Hard: Re-queued for this session! 🔁`, "warning");

      // Advance
      if (state.flashcard.index < state.flashcard.shuffledCards.length - 1) {
        state.flashcard.index++;
      }
      state.flashcard.isFlipped = false;
      renderFlashcardsView(mod);
    });

    // Good: Review in 3 days
    document.getElementById("srs-btn-good")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const cardId = currentCard.id;
      const prev = state.srsCards[cardId] || { reviewCount: 0 };
      state.srsCards[cardId] = {
        ease: "good",
        reviewCount: (prev.reviewCount || 0) + 1,
        lastReviewed: Date.now(),
        nextReviewDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
        intervalDays: 3
      };
      persistSRS();
      showToast(`"${currentCard.term}" scheduled for review in 3 days 📅`, "info");

      // Advance
      if (state.flashcard.index < cards.length - 1) {
        state.flashcard.index++;
      }
      state.flashcard.isFlipped = false;
      renderFlashcardsView(mod);
    });

    // Easy: Review in 7 days
    document.getElementById("srs-btn-easy")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const cardId = currentCard.id;
      const prev = state.srsCards[cardId] || { reviewCount: 0 };
      state.srsCards[cardId] = {
        ease: "easy",
        reviewCount: (prev.reviewCount || 0) + 1,
        lastReviewed: Date.now(),
        nextReviewDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        intervalDays: 7
      };
      persistSRS();
      showToast(`Mastered "${currentCard.term}"! Next review in 7 days ⭐`, "success");

      // Advance
      if (state.flashcard.index < cards.length - 1) {
        state.flashcard.index++;
      }
      state.flashcard.isFlipped = false;
      renderFlashcardsView(mod);
    });

    // Shuffle
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

    // Header Card
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

    // Scenario Narrative Card
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

    // Interactive Question & Options
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
          ${cs.options[userSelectedIdx].explanation}
        </div>
      ` : ''}
    `;
    container.appendChild(questionCard);

    // Expandable In-Depth Psychological Breakdown
    const breakdownSection = document.createElement("div");
    breakdownSection.className = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden";
    
    breakdownSection.innerHTML = `
      <div class="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" id="btn-toggle-breakdown">
        <div class="flex items-center gap-2.5">
          <span class="text-lg">🧠</span>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">In-Depth Psychological Breakdown</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">Mechanism, comparative theoretical lenses, and evidence-based interventions</p>
          </div>
        </div>
        <button class="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <svg class="w-5 h-5 transition-transform ${isRevealed ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>

      <div id="breakdown-body" class="${isRevealed ? 'block' : 'hidden'} border-t border-slate-100 dark:border-slate-800 p-6 space-y-6">
        
        <div>
          <h5 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Core Psychological Mechanism</h5>
          <h4 class="text-base font-bold text-slate-900 dark:text-white mb-2">${cs.breakdown.coreMechanism}</h4>
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${cs.breakdown.explanation}</p>
        </div>

        <div>
          <h5 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Comparative Theoretical Perspectives</h5>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${cs.breakdown.schoolComparisons.map(sc => `
              <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <span class="text-xs font-bold text-slate-900 dark:text-white block">${sc.school}</span>
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${sc.analysis}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
          <h5 class="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-1">Recommended Evidence-Based Intervention</h5>
          <p class="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">${cs.breakdown.clinicalIntervention}</p>
        </div>

      </div>
    `;

    container.appendChild(breakdownSection);
    DOM.tabContent.appendChild(container);

    // Question options click handler
    const optionBtns = container.querySelectorAll("[data-cs-oidx]");
    optionBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const oIdx = parseInt(btn.getAttribute("data-cs-oidx"), 10);
        state.caseStudyAnswers[cs.id] = oIdx;
        state.caseStudyRevealed[cs.id] = true; // Auto-unroll breakdown upon answering!
        persistSRS();
        renderCaseStudyView(mod);
      });
    });

    // Breakdown toggle
    document.getElementById("btn-toggle-breakdown")?.addEventListener("click", () => {
      state.caseStudyRevealed[cs.id] = !state.caseStudyRevealed[cs.id];
      renderCaseStudyView(mod);
    });
  }

  // 4. Practice Quiz View
  function renderQuizView(mod) {
    const container = document.createElement("div");
    container.className = "space-y-6 max-w-3xl mx-auto";

    const quizLength = mod.quiz.length;
    const answeredCount = Object.keys(state.quiz.answers).length;

    // Quiz Header Card
    const headerCard = document.createElement("div");
    headerCard.className = "bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4";
    
    let previousBest = state.userProgress.completedQuizzes[mod.id];
    let badgeHtml = "";
    if (previousBest !== undefined) {
      badgeHtml = `<span class="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Best Score: ${previousBest}/${quizLength} (${Math.round((previousBest/quizLength)*100)}%)</span>`;
    }

    headerCard.innerHTML = `
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">${mod.title}: Mastery Quiz</h2>
          ${badgeHtml}
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Test your comprehension with 5 exam-style conceptual questions.</p>
      </div>
      <div class="text-right flex-shrink-0">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Progress</span>
        <div class="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">${answeredCount} / ${quizLength} Answered</div>
      </div>
    `;
    container.appendChild(headerCard);

    // Quiz Results Banner (if submitted)
    if (state.quiz.submitted) {
      const pct = Math.round((state.quiz.score / quizLength) * 100);
      const isPerfect = pct === 100;
      const isPassed = pct >= 80;

      const resultsBanner = document.createElement("div");
      resultsBanner.className = `p-6 rounded-2xl border shadow-sm ${
        isPerfect 
          ? 'bg-emerald-500 text-white border-emerald-600' 
          : isPassed 
            ? 'bg-indigo-600 text-white border-indigo-700' 
            : 'bg-amber-500 text-white border-amber-600'
      }`;

      resultsBanner.innerHTML = `
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-widest text-white/80">Quiz Completed</span>
            <h3 class="text-2xl font-black">${isPerfect ? '🎉 Perfect Score!' : isPassed ? '👏 Great Job! Mastery Achieved' : '📚 Keep Reviewing!'}</h3>
            <p class="text-sm text-white/90">You scored ${state.quiz.score} out of ${quizLength} (${pct}%). Detailed answer explanations are shown below.</p>
          </div>
          <button id="btn-retake-quiz" class="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-sm shadow hover:bg-slate-100 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            <span>Retake Quiz</span>
          </button>
        </div>
      `;
      container.appendChild(resultsBanner);
    }

    // Render 5 Questions
    mod.quiz.forEach((q, qIndex) => {
      const qCard = document.createElement("div");
      qCard.className = "bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4";

      const selectedIdx = state.quiz.answers[q.id];

      qCard.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
            ${qIndex + 1}
          </div>
          <div class="flex-1">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">${q.question}</h3>
          </div>
        </div>

        <div class="space-y-2.5 pt-2" id="options-group-${q.id}">
          ${q.options.map((optText, optIdx) => {
            let extraClass = "";
            let iconIndicator = "";

            if (state.quiz.submitted) {
              const isCorrect = optIdx === q.correctIndex;
              const isSelected = selectedIdx === optIdx;

              if (isCorrect) {
                extraClass = "correct-choice font-bold";
                iconIndicator = `<svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
              } else if (isSelected && !isCorrect) {
                extraClass = "incorrect-choice font-semibold line-through";
                iconIndicator = `<svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>`;
              } else {
                extraClass = "opacity-50";
              }
            } else {
              if (selectedIdx === optIdx) {
                extraClass = "selected font-semibold";
                iconIndicator = `<div class="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0"></div>`;
              } else {
                iconIndicator = `<div class="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0"></div>`;
              }
            }

            return `
              <button 
                type="button" 
                data-qid="${q.id}" 
                data-oidx="${optIdx}" 
                class="quiz-option w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm flex items-center justify-between gap-3 ${extraClass} ${state.quiz.submitted ? 'disabled cursor-default' : 'cursor-pointer'}">
                <span class="text-slate-800 dark:text-slate-200 leading-relaxed">${optText}</span>
                ${iconIndicator}
              </button>
            `;
          }).join("")}
        </div>

        ${state.quiz.submitted ? `
          <div class="mt-4 p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
            selectedIdx === q.correctIndex 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
          }">
            <span class="font-bold block mb-1 ${selectedIdx === q.correctIndex ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}">
              ${selectedIdx === q.correctIndex ? '✓ Correct Explanation:' : '💡 Conceptual Explanation:'}
            </span>
            ${q.explanation}
          </div>
        ` : ''}
      `;

      container.appendChild(qCard);
    });

    // Submit Quiz Action Button
    if (!state.quiz.submitted) {
      const allAnswered = answeredCount === quizLength;
      const submitBar = document.createElement("div");
      submitBar.className = "flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm";
      submitBar.innerHTML = `
        <span class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          ${allAnswered ? 'All questions answered! Ready to grade.' : `Please answer all ${quizLength} questions to submit (${quizLength - answeredCount} remaining).`}
        </span>
        <button 
          id="btn-submit-quiz" 
          ${allAnswered ? '' : 'disabled'} 
          class="px-6 py-2.5 rounded-xl text-sm font-bold shadow transition-all ${
            allAnswered 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' 
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }">
          Submit & Grade Quiz
        </button>
      `;
      container.appendChild(submitBar);
    }

    DOM.tabContent.appendChild(container);

    // Option Selection Listeners
    if (!state.quiz.submitted) {
      const optionButtons = container.querySelectorAll(".quiz-option");
      optionButtons.forEach(btn => {
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
        persistSRS();
        renderSidebar();
        renderQuizView(mod);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (score === quizLength) {
          showToast("🏆 Perfect score on Module Quiz!", "success");
        }
      });
    } else {
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

    // Supplementary Study Tips Card
    const tipsCard = document.createElement("div");
    tipsCard.className = "bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-5 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 space-y-2";
    tipsCard.innerHTML = `
      <h4 class="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
        <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Evidence-Based Study Strategy: Active Recall & Spaced Repetition
      </h4>
      <p class="leading-relaxed">
        Research in cognitive psychology shows that passive re-reading has one of the lowest retention rates. To lock these concepts into long-term storage, test yourself with the Spaced Repetition Flashcard deck (rating Hard, Good, or Easy), analyze the Case Studies, and retake the 5-question quizzes spaced 24 to 72 hours apart.
      </p>
    `;
    container.appendChild(tipsCard);

    DOM.tabContent.appendChild(container);
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
        // Search in sections
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

        // Search in flashcards
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

        // Search in case studies
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
