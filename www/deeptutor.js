/**
 * DeepTutor AI - Socratic Learning & Tutoring Workspace
 * Zero-Build, Zero-Billing Hybrid Agentic Engine
 * 
 * Capabilities:
 * - Socratic Dialogue & Active Recall Guidance
 * - Vivid Concept & Biological Analogy Explainer
 * - Concept Clash (Direct Comparative Distinction Engine)
 * - Adaptive Weak-Spot & Exam-Trap Drill Generator
 * - Clinical & Applied Case Study Clinic
 * - Dual Engine: 100% Free Built-in Offline Socratic Engine + Optional BYOK Free Cloud/Local AI (Groq, Gemini, Ollama, OpenRouter)
 * - Student Memory & Study Notes Integration
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DeepTutor = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  "use strict";

  // ==========================================
  // 1. DEEPTUTOR CURRICULUM KNOWLEDGE BASE
  // ==========================================

  const KNOWLEDGE_BASE = {
    // Concept Clashes: Most frequently confused pairs across psychology
    clashes: [
      {
        id: "neg-reinf-vs-punish",
        modules: ["learning", "intro-history"],
        terms: ["negative reinforcement", "punishment", "positive punishment", "negative punishment"],
        pair: "Negative Reinforcement vs. Punishment",
        title: "The Ultimate Psychology Exam Trap: Reinforcement vs. Punishment",
        rule: "**Reinforcement ALWAYS increases** behavior frequency. **Punishment ALWAYS decreases** behavior frequency. **Negative** simply means *subtracting/removing* a stimulus.",
        contrast: [
          {
            name: "Negative Reinforcement (Increases Behavior)",
            goal: "Strengthen a desirable action by *removing* an unpleasant / aversive condition.",
            analogy: "The annoying seatbelt beeper in your car stops *only* after you click your belt. Buckling up (behavior) increases to escape the sound.",
            example: "Taking an aspirin to relieve a severe headache (relieving pain reinforces future aspirin use)."
          },
          {
            name: "Positive Punishment (Decreases Behavior)",
            goal: "Weaken an undesirable action by *adding* an aversive stimulus.",
            analogy: "A police officer hands you a costly speeding ticket.",
            example: "A puppy gets sprayed with water when chewing on electric cords."
          },
          {
            name: "Negative Punishment (Decreases Behavior)",
            goal: "Weaken an undesirable action by *removing* a pleasant / desirable stimulus.",
            analogy: "Taking away a teenager's phone or car keys after they broke curfew.",
            example: "A child loses 15 minutes of video game playtime for hitting their sibling."
          }
        ],
        checkQuestion: "A mother nags her teenage son to clean his bedroom every 10 minutes until he finally cleans it. The nagging stops. Is the son's cleaning behavior shaped by negative reinforcement or punishment?",
        checkAnswer: "Negative Reinforcement! His behavior (cleaning) removed the aversive stimulus (nagging), so cleaning increases in frequency."
      },
      {
        id: "classical-vs-operant",
        modules: ["learning", "intro-history"],
        terms: ["classical conditioning", "operant conditioning", "pavlov", "skinner"],
        pair: "Classical Conditioning (Pavlov) vs. Operant Conditioning (Skinner)",
        title: "Reflexive Association vs. Voluntary Consequences",
        rule: "Classical conditioning pairs **two stimuli** to elicit an **involuntary reflex**. Operant conditioning pairs a **voluntary behavior** with its **consequence (reward/punishment)**.",
        contrast: [
          {
            name: "Classical Conditioning (Involuntary / Reactive)",
            pioneer: "Ivan Pavlov (Dogs, Salivation, Bells)",
            mechanism: "Stimulus -> Stimulus -> Involuntary biological response.",
            analogy: "Flinching before the lightning strike's thunder arrives, or your mouth watering at the smell of fresh pizza."
          },
          {
            name: "Operant Conditioning (Voluntary / Proactive)",
            pioneer: "B.F. Skinner (Skinner Box, Rats, Levers)",
            mechanism: "Behavior -> Consequence (Reinforcement or Punishment) -> Future rate change.",
            analogy: "Studying extra hours to earn an 'A' grade or pressing an elevator button to reach your floor."
          }
        ],
        checkQuestion: "A dog sits on command because it expects a slice of bacon. Is this classical or operant conditioning?",
        checkAnswer: "Operant conditioning! Sitting is a voluntary emitted action governed by its reinforcing consequence (bacon)."
      },
      {
        id: "broca-vs-wernicke",
        modules: ["biological"],
        terms: ["broca's area", "wernicke's area", "aphasia", "language"],
        pair: "Broca's Aphasia vs. Wernicke's Aphasia",
        title: "Speech Production (Broca) vs. Speech Comprehension (Wernicke)",
        rule: "**Broca's = Broken Speech** (Frontal Lobe motor speech output). **Wernicke's = Word Salad** (Temporal Lobe language decoding).",
        contrast: [
          {
            name: "Broca's Area & Aphasia (Expressive / Motor)",
            location: "Left Frontal Lobe (near primary motor cortex)",
            symptoms: "The patient knows exactly what they want to say, but speech is slow, halting, effortful, and telegraphic ('...Book... table... read...'). Comprehension remains largely intact.",
            analogy: "A brilliant author typing on a keyboard where 80% of the keys are jammed."
          },
          {
            name: "Wernicke's Area & Aphasia (Receptive / Sensory)",
            location: "Left Temporal Lobe (near primary auditory cortex)",
            symptoms: "Fluent, effortless, grammatically rhythmic speech that lacks any coherent meaning ('Word salad': 'The blue fork danced over Tuesday's cloud'). The patient typically doesn't realize their words make no sense.",
            analogy: "A smooth-talking radio host broadcasting entirely in made-up alien vocabulary."
          }
        ],
        checkQuestion: "A stroke patient can clearly understand questions asked by doctors, but struggles intensely to articulate more than 1 or 2 isolated syllables. Which brain region suffered damage?",
        checkAnswer: "Broca's Area (in the left frontal lobe) - expressive motor speech deficit with preserved comprehension."
      },
      {
        id: "sympathetic-vs-parasympathetic",
        modules: ["biological"],
        terms: ["sympathetic", "parasympathetic", "autonomic nervous system", "fight or flight", "rest and digest"],
        pair: "Sympathetic vs. Parasympathetic Nervous System",
        title: "Fight-or-Flight Acceleration vs. Rest-and-Digest Braking",
        rule: "**Sympathetic** energizes the body for survival emergencies (Accelerator pedal). **Parasympathetic** conserves energy, slows heart rate, and restores baseline homeostasis (Brake pedal).",
        contrast: [
          {
            name: "Sympathetic Division (Fight, Flight, Freeze)",
            physiologicalEffects: "Pupils dilate, heart rate spikes, bronchi open for oxygen, digestion halts, glucose released from liver, adrenaline floods bloodstream.",
            mnemonic: "Sympathetic = You have 'sympathy' for a person running away from a bear."
          },
          {
            name: "Parasympathetic Division (Rest and Digest / Feed and Breed)",
            physiologicalEffects: "Pupils constrict, heart rate slows, salivation resumes, digestive enzymes activate, bladder contracts.",
            mnemonic: "Parasympathetic = 'Parachute' that brings your soaring heart rate safely back down."
          }
        ],
        checkQuestion: "After narrowly escaping a car crash, your racing pulse slows, your breathing deepens, and your stomach grumbles. Which branch is now in control?",
        checkAnswer: "The Parasympathetic division is restoring equilibrium and digestive function."
      },
      {
        id: "proactive-vs-retroactive-interference",
        modules: ["cognitive"],
        terms: ["proactive interference", "retroactive interference", "memory forgetting"],
        pair: "Proactive vs. Retroactive Interference",
        title: "The Battle of Memories: P.O.R.N. Mnemonic",
        rule: "Use the classic psychology mnemonic: **P.O.R.N.** -> **P**roactive: **O**ld blocks new. **R**etroactive: **N**ew blocks old.",
        contrast: [
          {
            name: "Proactive Interference (Old blocks New)",
            direction: "Old memories interfere with your ability to recall newly encoded information.",
            realWorld: "Writing the previous calendar year on checks throughout January, or calling your new partner by your ex's name."
          },
          {
            name: "Retroactive Interference (New blocks Old)",
            direction: "New information interferes with your ability to retrieve older stored memories.",
            realWorld: "After memorizing your new phone number, you suddenly can no longer remember your childhood landline."
          }
        ],
        checkQuestion: "You study Spanish in high school, then take French in college. On your French exam, Spanish vocabulary keeps popping into your head. Is this proactive or retroactive interference?",
        checkAnswer: "Proactive interference! Old knowledge (Spanish) is intruding forward into newer memories (French)."
      },
      {
        id: "schizophrenia-positive-vs-negative",
        modules: ["disorders"],
        terms: ["schizophrenia", "positive symptoms", "negative symptoms", "hallucinations", "delusions"],
        pair: "Positive vs. Negative Symptoms in Schizophrenia",
        title: "Pathological Additions vs. Behavioral Reductions",
        rule: "'Positive' and 'negative' do **NOT** mean 'good' vs 'bad'. **Positive = Additions** beyond normal experience. **Negative = Deficits / Subtractions** of normal functioning.",
        contrast: [
          {
            name: "Positive Symptoms (Excesses / Distortions)",
            symptoms: "Auditory hallucinations (hearing voices), delusions of grandeur or persecution, disorganized speech (loose associations), catatonic agitation.",
            biologicalBasis: "Frequently associated with dopamine hyperactivity in the mesolimbic pathway."
          },
          {
            name: "Negative Symptoms (Deficits / Removals)",
            symptoms: "Flat affect (emotionless voice/face), anhedonia (inability to feel pleasure), alogia (poverty of speech), avolition (lack of goal-directed motivation).",
            biologicalBasis: "Frequently associated with structural brain abnormalities, ventricular enlargement, and prefrontal hypoactivity."
          }
        ],
        checkQuestion: "A patient with schizophrenia shows complete emotional blunting, sits motionless without speaking, and displays no interest in seeing loved ones. Are these positive or negative symptoms?",
        checkAnswer: "Negative symptoms! They represent the absence or subtraction of healthy emotional and motivational responses."
      }
    ],

    // Vivid Analogies for Core Concepts
    analogies: {
      "action-potential": {
        concept: "Action Potential (Neural Firing)",
        analogyTitle: "The Flush of a Toilet",
        metaphor: `Think of a neuron firing like flushing an old-fashioned toilet:
1. **All-or-None Principle:** You cannot push the toilet handle half-way for a 'half flush'. If you hit threshold, it flushes with 100% full force every single time.
2. **Depolarization (The Flush):** Pushing the handle opens the tank gate—Sodium (Na+) rushes into the axon like water rushing down the bowl.
3. **Refractory Period (Refilling Tank):** Immediately after flushing, you can push the handle all you want, but nothing happens until the tank refills (the sodium-potassium pump restores the negative resting potential of -70mV).
4. **Directional Flow:** The water only flushes in one direction down the drain, never reversing backwards up the pipe.`,
        keyTakeaway: "Neurons do not communicate by varying the strength of an action potential; they communicate by varying the *frequency* and *speed* of firing.",
        socraticCheck: "If you touch a lukewarm mug versus a scalding hot stove, do your pain neurons fire bigger action potentials or more frequent action potentials?"
      },
      "synapse-neurotransmitters": {
        concept: "Synaptic Transmission & Neurotransmitters",
        analogyTitle: "The Harbor Ferry and Docking Slip",
        metaphor: `An electrical action potential cannot physically jump across the synaptic gap, just like a car cannot drive across open water:
1. **Presynaptic Terminal:** The ferry loading terminal where vesicle vesicles pack chemical passengers (neurotransmitters).
2. **Synaptic Cleft:** The narrow body of water between two landmasses.
3. **Postsynaptic Receptors:** Specific boat slips with exact physical shapes. Dopamine will only dock in a dopamine receptor slip (Lock-and-Key hypothesis).
4. **Reuptake:** Once the passengers alight, empty ferries are drawn back into the original dock terminal via the reuptake pump to be recycled for the next trip (this is the mechanism that SSRI antidepressants block).`,
        keyTakeaway: "Chemical signaling converts electrical impulses into modular, chemically tunable messages.",
        socraticCheck: "If an antidepressant is an SSRI (Selective Serotonin Reuptake Inhibitor), does it make the brain produce more serotonin or does it keep serotonin lingering longer in the synaptic ferry slips?"
      },
      "atkinson-shiffrin-memory": {
        concept: "Three-Stage Memory Model (Sensory -> STM -> LTM)",
        analogyTitle: "The Desktop Computer Architecture",
        metaphor: `Your memory mirrors modern computer hardware architecture:
1. **Sensory Memory = The Webcam & Microphone Buffer:** Captures raw, high-resolution sensory data (iconic visual, echoic auditory) for mere fractions of a second. If you don't focus attention, it instantly overwrites.
2. **Short-Term / Working Memory = System RAM:** The temporary active workspace (holding roughly 7 ± 2 items or 4 chunks for 20-30 seconds). If power cuts without saving, anything sitting solely in RAM vanishes.
3. **Long-Term Memory = The Solid State Hard Drive:** Massive, virtually unlimited permanent storage. Encoding is hitting 'Save As'; Retrieval is double-clicking a file to load it back into active RAM.`,
        keyTakeaway: "Forgetting often isn't the file being deleted from your hard drive; it's a broken desktop shortcut (retrieval failure).",
        socraticCheck: "When you use 'chunking' (grouping digits like 1-800-222-3333), are you expanding your brain's hard drive capacity or maximizing the limited slots in your active RAM?"
      },
      "piaget-cognitive-development": {
        concept: "Piaget's 4 Stages of Cognitive Development",
        analogyTitle: "Upgrading a Smartphone Operating System",
        metaphor: `Children are not mini-adults who know less; they literally run different mental operating systems:
1. **Sensorimotor (0-2 yrs) - OS 1.0 (Direct Touch & Sensor):** Pure sensory feedback. If an object is hidden behind a pillow, it ceases to exist (*Lack of Object Permanence*).
2. **Preoperational (2-7 yrs) - OS 2.0 (Camera with No Undo Button):** Rich imagination and symbols, but lacks logical reversibility (*Centration*) and cannot see perspectives other than their own (*Egocentrism*). A tall thin glass of water is judged to have 'more' than a wide glass.
3. **Concrete Operational (7-11 yrs) - OS 3.0 (Spreadsheets & Organization):** Masters conservation and physical arithmetic. Understands that physical matter remains constant across visual shape changes.
4. **Formal Operational (12+ yrs) - OS 4.0 (Abstract Programming & Hypotheticals):** Can write hypothetical code, ponder philosophical justice, ethics, counterfactuals ('What if gravity ceased to exist tomorrow?').`,
        keyTakeaway: "Assimilation is fitting new data into existing mental folders; Accommodation is creating a brand new folder when the data doesn't fit.",
        socraticCheck: "A child weeps because you sliced their single sandwich into 4 triangles, believing they now have 'too much food to finish'. Which Piagetian stage are they operating in?"
      },
      "freud-personality-structure": {
        concept: "Freud's Id, Ego, and Superego",
        analogyTitle: "The Toddler, the Judge, and the Exhausted Mediator",
        metaphor: `Freud conceptualized the human psyche as an eternal 3-way conference call:
1. **The Id (The Toddler):** Operates purely on the *Pleasure Principle*. Unconscious, impulsive, biological drives ('I want that cake right now, give it to me!').
2. **The Superego (The Moral Judge):** The internalized conscience forged by society and parents. Demands perfection, radiates guilt, and enforces rules ('Eating cake is selfish and gluttonous; you should feel ashamed').
3. **The Ego (The Adult Mediator):** Operates on the *Reality Principle*. Rational, conscious, realistic executive balance ('Let's eat a healthy lunch first, then we can enjoy a small slice of cake guilt-free').`,
        keyTakeaway: "When the Ego cannot peacefully reconcile the screaming demands of the Id and Superego, it deploys unconscious *Defense Mechanisms* (repression, projection, rationalization) to quell anxiety.",
        socraticCheck: "If a student fails an exam and claims 'the professor wrote completely unfair questions designed to fail everyone', which defense mechanism is their Ego using?"
      }
    },

    // Interactive Socratic Drills & Common Exam Traps
    drills: [
      {
        id: "drill-1",
        moduleId: "intro-history",
        title: "Pioneers & Historical Schools",
        scenario: "A psychologist argues: 'We cannot scientifically measure the unconscious mind or subjective introspective feelings. Psychology should focus solely on observable stimuli and measurable motor responses.'",
        question: "Which major psychological school of thought does this researcher represent?",
        options: [
          "Structuralism (Wilhelm Wundt)",
          "Psychoanalysis (Sigmund Freud)",
          "Behaviorism (John B. Watson & B.F. Skinner)",
          "Humanistic Psychology (Carl Rogers)"
        ],
        answerIdx: 2,
        hint: "Think about who rejected the 'black box' of the mind in favor of conditioning and observable behavior.",
        explanation: "Behaviorism, pioneered by John B. Watson and championed by B.F. Skinner, insisted that scientific psychology must restrict its scope to objectively observable and measurable behavior."
      },
      {
        id: "drill-2",
        moduleId: "biological",
        title: "Neurotransmitter Function & Deficiency",
        scenario: "A 68-year-old patient displays muscle tremors, rigidity, and difficulty initiating voluntary movement. Neurological scans reveal severe degradation of dopamine-producing cells in the substantia nigra.",
        question: "Which condition is this patient experiencing?",
        options: [
          "Alzheimer's Disease (Acetylcholine deficit)",
          "Parkinson's Disease (Dopamine deficit)",
          "Multiple Sclerosis (Myelin sheath decay)",
          "Huntington's Disease (GABA deficit)"
        ],
        answerIdx: 1,
        hint: "Dopamine controls smooth motor pathways; L-Dopa is standard treatment.",
        explanation: "Parkinson's disease is caused by the death of dopamine-synthesizing neurons in the substantia nigra, resulting in hallmark tremors and motor freezing."
      },
      {
        id: "drill-3",
        moduleId: "cognitive",
        title: "Cognitive Biases in Action",
        scenario: "After hearing multiple sensational news reports about a recent airplane crash, Marcus decides to drive 1,200 miles across the country instead of taking a 2-hour flight, despite statistically knowing driving is far more dangerous.",
        question: "Which cognitive decision-making heuristic is distorting Marcus's risk assessment?",
        options: [
          "Representativeness Heuristic",
          "Availability Heuristic",
          "Confirmation Bias",
          "Framing Effect"
        ],
        answerIdx: 1,
        hint: "His decision is swayed by how readily vivid emotional memories come to mind.",
        explanation: "The Availability Heuristic leads people to estimate the likelihood of events based on how easily examples can be recalled from memory. Vivid plane crash media makes the danger feel imminent."
      },
      {
        id: "drill-4",
        moduleId: "social",
        title: "Attribution Theory Traps",
        scenario: "When Sarah sees a driver swerve abruptly in traffic, she mutters: 'What a reckless, selfish idiot!' However, when Sarah herself swerves in traffic later that day, she excuses it: 'I had to dodge a giant pothole in the road.'",
        question: "Sarah's contrasting explanations illustrate which psychological phenomenon?",
        options: [
          "Fundamental Attribution Error & Actor-Observer Bias",
          "Deindividuation",
          "Cognitive Dissonance",
          "Bystander Diffusion of Responsibility"
        ],
        answerIdx: 0,
        hint: "Overestimating internal disposition for others, while blaming external situational factors for oneself.",
        explanation: "The Actor-Observer Bias (and FAE) dictates that we attribute other people's behavior to their internal character traits ('reckless idiot') while attributing our own behavior to external situational circumstances ('pothole')."
      },
      {
        id: "drill-5",
        moduleId: "disorders",
        title: "Evidence-Based Psychotherapies",
        scenario: "Elena suffers from an overwhelming phobia of elevators. Her clinical psychologist teaches her progressive muscle relaxation and constructs an anxiety hierarchy, having her gradually visualize, stand near, step inside, and ride an elevator across multiple sessions.",
        question: "Which behavioral therapy technique is being utilized?",
        options: [
          "Free Association",
          "Systematic Desensitization",
          "Aversive Conditioning",
          "Rational Emotive Behavior Therapy (REBT)"
        ],
        answerIdx: 1,
        hint: "Joseph Wolpe's classical conditioning approach that pairs deep relaxation with a graduated fear hierarchy.",
        explanation: "Systematic Desensitization uses counterconditioning to replace a conditioned fear response with relaxation, ascending an anxiety hierarchy step-by-step."
      }
    ],

    // Clinical Case Studies
    cases: [
      {
        id: "case-amnesia",
        moduleId: "cognitive",
        title: "Case Study: The Case of 'Patient H.M.' (Henry Molaison)",
        patient: "Henry (Age 27) underwent bilateral surgical resection of both medial temporal lobes (including both hippocampi) to alleviate intractable epileptic seizures.",
        symptoms: "Following the surgery, his high-school memories and vocabulary remained intact, and his IQ improved. However, he could no longer remember what he ate for breakfast 10 minutes ago, nor could he remember the doctors who greeted him every morning for 40 years. Intriguingly, when taught to trace a star while looking in a mirror (motor skill), his performance improved daily, though he swore each morning he had never seen the apparatus before.",
        socraticBreakdown: [
          "**1. Anterograde Amnesia:** The inability to form new declarative/explicit long-term memories.",
          "**2. Hippocampus as Memory Consolidation Center:** The hippocampus does NOT permanently store long-term memories; it consolidates short-term memories into the neocortex over time.",
          "**3. Explicit vs. Implicit Dissociation:** Implicit procedural memory (motor tracing) is mediated by the cerebellum and basal ganglia, remaining completely functional even when the hippocampus is removed!"
        ],
        reflection: "Why did Patient H.M.'s case revolutionize our scientific understanding of memory as multiple distinct biological systems rather than a single unified storage unit?"
      },
      {
        id: "case-splitbrain",
        moduleId: "biological",
        title: "Case Study: The Split-Brain Experiments (Sperry & Gazzaniga)",
        patient: "Joe had his corpus callosum surgically severed to stop severe epileptic seizures across his cerebral hemispheres.",
        symptoms: "When an image of a key is flashed exclusively to Joe's Left Visual Field (processed by the Right Hemisphere), he states verbally: 'I saw nothing.' Yet, when asked to reach under a partition with his Left Hand (controlled by the Right Hemisphere), his hand immediately picks up the key from a tray of objects!",
        socraticBreakdown: [
          "**1. Contralateral Organization:** Left visual field maps to the right hemisphere; left hand is motor-controlled by the right hemisphere.",
          "**2. Left Hemisphere Lateralization for Language:** Broca's and Wernicke's speech centers reside in the left hemisphere. The right hemisphere saw the key, recognized it, and directed the left hand to pick it up, but could not transmit that information across the severed callosum to the left hemisphere's speech center!"
        ],
        reflection: "What does the split-brain phenomenon reveal about how the conscious 'narrator' of the mind operates?"
      }
    ]
  };

  // ==========================================
  // 2. DEEPTUTOR APPLICATION & ENGINE STATE
  // ==========================================

  const DEFAULT_CONFIG = {
    provider: "offline", // "offline" | "groq" | "gemini" | "ollama" | "openrouter"
    groqKey: "",
    groqModel: "llama-3.3-70b-versatile",
    geminiKey: "",
    geminiModel: "gemini-2.0-flash",
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "qwen2.5:3b",
    openrouterKey: "",
    openrouterModel: "google/gemini-2.0-flash-exp:free"
  };

  const state = {
    config: { ...DEFAULT_CONFIG },
    activeMode: "socratic", // "socratic" | "analogy" | "clash" | "drill" | "case"
    currentModuleId: "intro-history",
    chatHistories: {}, // moduleId -> array of { role, content, mode, timestamp }
    isGenerating: false,
    abortController: null,
    ttsSpeaking: false
  };

  // Load config from localStorage
  function loadConfig() {
    try {
      const saved = localStorage.getItem("psych_deeptutor_config");
      if (saved) {
        state.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load DeepTutor config", e);
    }
  }

  // Save config
  function saveConfig(newConfig) {
    state.config = { ...state.config, ...newConfig };
    localStorage.setItem("psych_deeptutor_config", JSON.stringify(state.config));
  }

  // Get chat history for a module
  function getHistory(moduleId) {
    if (!state.chatHistories[moduleId]) {
      state.chatHistories[moduleId] = [];
      // Initialize with welcome message
      const mod = (typeof PSYCH_DATA !== 'undefined' && PSYCH_DATA.modules) 
        ? PSYCH_DATA.modules.find(m => m.id === moduleId) 
        : null;
      const modTitle = mod ? mod.title : "Psychology 101";

      state.chatHistories[moduleId].push({
        role: "assistant",
        mode: "socratic",
        timestamp: Date.now(),
        content: `👋 **Hello! I'm DeepTutor**, your interactive Socratic psychology mentor.\n\nI'm currently grounded in **${modTitle}**. Rather than simply reciting textbook answers, I'll help you unpack complex theories with **vivid analogies**, test your understanding with **active recall questions**, and help you navigate tricky **exam traps**.\n\nWhat would you like to explore first? Select a mode above or tap one of the suggested prompts below!`
      });
    }
    return state.chatHistories[moduleId];
  }

  // ==========================================
  // 3. STUDENT MEMORY & PROGRESS INSPECTOR
  // ==========================================

  function getStudentMemorySummary(moduleId) {
    let masteredCount = 0;
    let dueCount = 0;
    let quizScore = null;
    let weakTerms = [];

    try {
      const srsRaw = localStorage.getItem("psych_srs_cards");
      if (srsRaw) {
        const srs = JSON.parse(srsRaw);
        if (typeof PSYCH_DATA !== 'undefined' && PSYCH_DATA.modules) {
          const mod = PSYCH_DATA.modules.find(m => m.id === moduleId);
          if (mod && mod.flashcards) {
            mod.flashcards.forEach(fc => {
              const cardData = srs[fc.id];
              if (cardData && cardData.repetitions >= 2) {
                masteredCount++;
              } else {
                dueCount++;
                weakTerms.push(fc.term);
              }
            });
          }
        }
      }

      const quizzesRaw = localStorage.getItem("psych_progress_quizzes");
      if (quizzesRaw) {
        const quizzes = JSON.parse(quizzesRaw);
        if (quizzes[moduleId] !== undefined) {
          quizScore = quizzes[moduleId];
        }
      }
    } catch (e) {
      console.warn("Memory retrieval error", e);
    }

    return {
      moduleId,
      masteredCount,
      dueCount,
      quizScore,
      weakTerms: weakTerms.slice(0, 4)
    };
  }

  // ==========================================
  // 4. OFFLINE SOCRATIC HEURISTIC ENGINE
  // ==========================================

  function generateOfflineResponse(userQuery, moduleId, mode) {
    const q = userQuery.toLowerCase().trim();
    const mod = (typeof PSYCH_DATA !== 'undefined' && PSYCH_DATA.modules)
      ? PSYCH_DATA.modules.find(m => m.id === moduleId)
      : null;
    const modTitle = mod ? mod.title : "Psychology 101";

    // 1. Concept Clash Mode or Query asking for comparison
    const isClashQuery = mode === "clash" || q.includes("compare") || q.includes("vs") || q.includes("versus") || q.includes("difference between") || q.includes("contrast");
    if (isClashQuery) {
      let matchedClash = KNOWLEDGE_BASE.clashes.find(c => 
        c.terms.some(t => q.includes(t)) || q.includes(c.id)
      );

      // If in clash mode without specific match, pick clash relevant to module or first clash
      if (!matchedClash) {
        matchedClash = KNOWLEDGE_BASE.clashes.find(c => c.modules.includes(mod?.id?.split("-")[0] || "")) || KNOWLEDGE_BASE.clashes[0];
      }

      if (matchedClash) {
        let resp = `### ⚔️ Concept Clash: ${matchedClash.title}\n\n`;
        resp += `> [!IMPORTANT]\n> **Core Rule:** ${matchedClash.rule}\n\n`;
        resp += `#### Detailed Breakdown\n\n`;

        matchedClash.contrast.forEach(item => {
          resp += `* **${item.name}**\n`;
          if (item.goal) resp += `  * *Goal:* ${item.goal}\n`;
          if (item.pioneer) resp += `  * *Pioneer:* ${item.pioneer}\n`;
          if (item.location) resp += `  * *Neural Location:* ${item.location}\n`;
          if (item.mechanism) resp += `  * *Mechanism:* ${item.mechanism}\n`;
          if (item.physiologicalEffects) resp += `  * *Physiological Signature:* ${item.physiologicalEffects}\n`;
          if (item.symptoms) resp += `  * *Clinical Presentation:* ${item.symptoms}\n`;
          if (item.analogy) resp += `  * *Analogy:* ${item.analogy}\n`;
          if (item.example) resp += `  * *Example:* ${item.example}\n`;
          if (item.realWorld) resp += `  * *Real-World Impact:* ${item.realWorld}\n`;
          if (item.mnemonic) resp += `  * *Memory Mnemonic:* ${item.mnemonic}\n`;
        });

        resp += `\n---\n\n#### 🧠 Socratic Self-Test\n*${matchedClash.checkQuestion}*\n\n*(Type your answer below or ask for the solution!)*`;
        return resp;
      }
    }

    // 2. Analogy Mode or Query asking for analogy/metaphor
    const isAnalogyQuery = mode === "analogy" || q.includes("analogy") || q.includes("metaphor") || q.includes("like a") || q.includes("explain simply");
    if (isAnalogyQuery) {
      // Find matching analogy
      let matchedAnalogy = null;
      for (const [key, an] of Object.entries(KNOWLEDGE_BASE.analogies)) {
        if (q.includes(key.replace("-", " ")) || q.includes(an.concept.toLowerCase()) || q.includes(key.split("-")[0])) {
          matchedAnalogy = an;
          break;
        }
      }

      if (!matchedAnalogy) {
        // Fallback to a default analogy based on module
        if (moduleId === "biological") matchedAnalogy = KNOWLEDGE_BASE.analogies["action-potential"];
        else if (moduleId === "cognitive") matchedAnalogy = KNOWLEDGE_BASE.analogies["atkinson-shiffrin-memory"];
        else if (moduleId === "developmental") matchedAnalogy = KNOWLEDGE_BASE.analogies["piaget-cognitive-development"];
        else if (moduleId === "personality") matchedAnalogy = KNOWLEDGE_BASE.analogies["freud-personality-structure"];
        else matchedAnalogy = KNOWLEDGE_BASE.analogies["synapse-neurotransmitters"];
      }

      let resp = `### 💡 DeepTutor Analogy: ${matchedAnalogy.concept}\n\n`;
      resp += `**Metaphor: ${matchedAnalogy.analogyTitle}**\n\n`;
      resp += `${matchedAnalogy.metaphor}\n\n`;
      resp += `> [!TIP]\n> **Key Takeaway:** ${matchedAnalogy.keyTakeaway}\n\n`;
      resp += `#### 🎯 Reflection Challenge\n*${matchedAnalogy.socraticCheck}*`;
      return resp;
    }

    // 3. Drill / Quiz Mode
    const isDrillQuery = mode === "drill" || q.includes("drill") || q.includes("test me") || q.includes("quiz me") || q.includes("exam trap") || q.includes("practice question");
    if (isDrillQuery) {
      const availableDrills = KNOWLEDGE_BASE.drills.filter(d => d.moduleId === moduleId || d.moduleId === "intro-history");
      const drill = availableDrills[Math.floor(Math.random() * availableDrills.length)] || KNOWLEDGE_BASE.drills[0];

      let resp = `### 🎯 Diagnostic Socratic Drill: ${drill.title}\n\n`;
      resp += `**Scenario:**\n> "${drill.scenario}"\n\n`;
      resp += `**Question:** **${drill.question}**\n\n`;
      drill.options.forEach((opt, idx) => {
        resp += `${idx + 1}. ${opt}\n`;
      });
      resp += `\n---\n*💡 **Hint:** ${drill.hint}*\n\n*(Reply with your choice 1-4 to check your reasoning!)*`;
      return resp;
    }

    // 4. Case Study Mode
    const isCaseQuery = mode === "case" || q.includes("case") || q.includes("patient") || q.includes("clinical vignette");
    if (isCaseQuery) {
      const c = KNOWLEDGE_BASE.cases.find(cs => cs.moduleId === moduleId) || KNOWLEDGE_BASE.cases[0];
      let resp = `### 🩺 Clinical & Applied Case Study\n\n`;
      resp += `#### ${c.title}\n\n`;
      resp += `* **Patient History:** ${c.patient}\n`;
      resp += `* **Clinical Presentation:** ${c.symptoms}\n\n`;
      resp += `#### Socratic Mechanism Analysis\n`;
      c.socraticBreakdown.forEach(pt => {
        resp += `${pt}\n`;
      });
      resp += `\n---\n**Discussion Question for You:**\n*${c.reflection}*`;
      return resp;
    }

    // 5. Check if user answered a drill (e.g. "1", "2", "3", "4", or keywords)
    if (/^[1-4]$/.test(q)) {
      const choice = parseInt(q, 10);
      return `### 📝 Answer Evaluation\n\nYou selected **Option ${choice}**.\n\n* **Why active retrieval matters:** When you test yourself before looking up notes, you reinforce neural pathways through the **Testing Effect** (Roediger & Karpicke).\n\nIf you'd like another question or want to unpack any specific term from the question, just ask **"Give me another drill"** or **"Explain why the other options were wrong"**!`;
    }

    // 6. Direct Keyword Search in Module Flashcards and Sections
    if (mod) {
      // Check flashcards
      const matchedCard = mod.flashcards?.find(fc => 
        q.includes(fc.term.toLowerCase()) || fc.definition.toLowerCase().includes(q)
      );

      if (matchedCard) {
        return `### 📖 Concept Spotlight: **${matchedCard.term}**\n\n` +
               `**Formal Scientific Definition:**\n${matchedCard.definition}\n\n` +
               (matchedCard.analogy ? `**Everyday Analogy:**\n💡 *${matchedCard.analogy}*\n\n` : "") +
               (matchedCard.example ? `**Real-World Application:**\n🌍 ${matchedCard.example}\n\n` : "") +
               `---\n\n` +
               `#### 🧠 Socratic Inquiry\n` +
               `In your own words, how would you distinguish **${matchedCard.term}** from other similar concepts in ${mod.title}? What makes it unique?`;
      }

      // Check sections
      const matchedSection = mod.sections?.find(sec => 
        q.includes(sec.title.toLowerCase()) || sec.content.toLowerCase().includes(q)
      );

      if (matchedSection) {
        const snippet = matchedSection.content.slice(0, 500).replace(/\n+/g, " ");
        return `### 🔍 Deep Dive: **${matchedSection.title}**\n\n` +
               `${snippet}...\n\n` +
               `> [!TIP]\n` +
               `> **Conceptual Synthesis:** In ${modTitle}, this concept forms the core schema for how psychologists analyze mental events.\n\n` +
               `Would you like me to:\n` +
               `1. **Explain this with an everyday analogy**\n` +
               `2. **Show the most common exam trap related to this**\n` +
               `3. **Test your active recall with a quick 1-question scenario drill?**`;
      }
    }

    // 7. General Socratic Fallback
    const memory = getStudentMemorySummary(moduleId);
    let weaknessPrompt = "";
    if (memory.weakTerms.length > 0) {
      weaknessPrompt = `\n\n*💡 **Study Tip:** Your flashcards show that you're currently working on mastering: **${memory.weakTerms.join(", ")}**. Would you like to drill those?*`;
    }

    return `### 🧠 DeepTutor Insight: ${modTitle}\n\n` +
           `That's a thoughtful question regarding **"${userQuery}"**.\n\n` +
           `To understand this through a scientific lens, remember that psychological phenomena are best understood through the **Biopsychosocial Model**:\n` +
           `* **Biological:** How neural circuitry, hormones, and evolutionary genetics structure this behavior.\n` +
           `* **Psychological:** How internal cognitive schemas, expectations, and emotional appraisals interpret it.\n` +
           `* **Social-Cultural:** How peer expectations, family models, and environmental reinforcers shape the outcome.\n\n` +
           `How would you like to deepen your understanding?\n` +
           `* Tap **💡 Analogy** above to break down abstract neural mechanisms with vivid metaphors.\n` +
           `* Tap **⚔️ Concept Clash** to contrast easily confused terms.\n` +
           `* Tap **🎯 Socratic Drill** to test your exam readiness.${weaknessPrompt}`;
  }

  // ==========================================
  // 5. LIVE CLOUD / LOCAL AI ENGINE (BYOK)
  // ==========================================

  async function generateLiveResponse(userQuery, moduleId, mode, onChunk, onDone, onError) {
    const cfg = state.config;
    const mod = (typeof PSYCH_DATA !== 'undefined' && PSYCH_DATA.modules)
      ? PSYCH_DATA.modules.find(m => m.id === moduleId)
      : null;
    const modTitle = mod ? mod.title : "Psychology 101";

    let endpoint = "";
    let apiKey = "";
    let modelName = "";

    if (cfg.provider === "groq") {
      endpoint = "https://api.groq.com/openai/v1/chat/completions";
      apiKey = cfg.groqKey;
      modelName = cfg.groqModel || "llama-3.3-70b-versatile";
    } else if (cfg.provider === "gemini") {
      endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      apiKey = cfg.geminiKey;
      modelName = cfg.geminiModel || "gemini-2.0-flash";
    } else if (cfg.provider === "ollama") {
      const base = cfg.ollamaUrl.replace(/\/+$/, "");
      endpoint = `${base}/v1/chat/completions`;
      apiKey = "ollama";
      modelName = cfg.ollamaModel || "qwen2.5:3b";
    } else if (cfg.provider === "openrouter") {
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      apiKey = cfg.openrouterKey;
      modelName = cfg.openrouterModel || "google/gemini-2.0-flash-exp:free";
    } else {
      // Offline fallback
      const offlineText = generateOfflineResponse(userQuery, moduleId, mode);
      simulateOfflineStream(offlineText, onChunk, onDone);
      return;
    }

    if (cfg.provider !== "ollama" && !apiKey) {
      throw new Error(`No API key provided for ${cfg.provider.toUpperCase()}. Please configure in DeepTutor Settings or switch to the Built-in Offline Engine.`);
    }

    const systemPrompt = `You are DeepTutor, an elite Socratic psychology tutor embedded in an interactive Psychology 101 study application.
Current Module: ${modTitle}.
Pedagogy Guidelines:
1. Socratic Method: Guide the student with clear conceptual breakdowns, vivid everyday analogies, and targeted active-recall reflection questions.
2. Structure: Use markdown with bold headers, bullet points, and callouts (> [!TIP] or > [!IMPORTANT]).
3. Accuracy: Strictly ground claims in peer-reviewed psychological science (e.g. Piaget, Skinner, Pavlov, Freud, Milgram, Gazzaniga, Kahneman).
4. Brevity: Be engaging, enthusiastic, and concise (under 250 words per response). Conclude every substantive response with a quick 1-sentence check question.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...getHistory(moduleId).slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: userQuery }
    ];

    state.abortController = new AbortController();

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: messages,
          temperature: 0.6,
          stream: true
        }),
        signal: state.abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(errMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep remainder

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                fullText += delta;
                onChunk(delta, fullText);
              }
            } catch (jsonErr) {
              // Ignore non-json chunks
            }
          }
        }
      }

      onDone(fullText);
    } catch (err) {
      if (err.name === "AbortError") {
        onDone(fullText);
        return;
      }
      onError(err);
    } finally {
      state.abortController = null;
    }
  }

  // Simulate smooth streaming for the offline engine
  function simulateOfflineStream(fullText, onChunk, onDone) {
    const words = fullText.split(" ");
    let current = "";
    let i = 0;
    const interval = 12; // ms per word

    const timer = setInterval(() => {
      if (i >= words.length || !state.isGenerating) {
        clearInterval(timer);
        onDone(fullText);
        return;
      }
      current += (i === 0 ? "" : " ") + words[i];
      onChunk(words[i] + " ", current);
      i++;
    }, interval);
  }

  // Test provider connection
  async function testConnection(provider, key, model, url) {
    let endpoint = "";
    let authHeader = `Bearer ${key}`;
    let testModel = model;

    if (provider === "groq") {
      endpoint = "https://api.groq.com/openai/v1/chat/completions";
      testModel = testModel || "llama-3.3-70b-versatile";
    } else if (provider === "gemini") {
      endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      testModel = testModel || "gemini-2.0-flash";
    } else if (provider === "ollama") {
      const base = (url || "http://localhost:11434").replace(/\/+$/, "");
      endpoint = `${base}/v1/chat/completions`;
      authHeader = "Bearer ollama";
      testModel = testModel || "qwen2.5:3b";
    } else if (provider === "openrouter") {
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      testModel = testModel || "google/gemini-2.0-flash-exp:free";
    } else {
      return { success: true, message: "Built-in Offline Engine is always ready!" };
    }

    const start = performance.now();
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify({
          model: testModel,
          messages: [{ role: "user", content: "Ping: Respond with 'OK'" }],
          max_tokens: 10
        })
      });

      const latency = Math.round(performance.now() - start);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      return {
        success: true,
        latencyMs: latency,
        message: `Connected successfully to ${testModel} (${latency}ms)!`
      };
    } catch (e) {
      return {
        success: false,
        latencyMs: Math.round(performance.now() - start),
        message: e.message
      };
    }
  }

  // ==========================================
  // 6. UI COMPONENT RENDERING & INTERACTIONS
  // ==========================================

  // Markdown to HTML light formatter
  function formatMarkdown(text) {
    if (!text) return "";
    let html = text
      // Escape script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Headers
      .replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">$1</h4>')
      .replace(/^#### (.*$)/gim, '<h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1">$1</h5>')
      // Callouts: > [!TIP] or > [!IMPORTANT]
      .replace(/> \[!TIP\]\n> (.*)/gim, '<div class="p-2.5 my-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-200 font-medium">💡 $1</div>')
      .replace(/> \[!IMPORTANT\]\n> (.*)/gim, '<div class="p-2.5 my-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 text-xs text-indigo-800 dark:text-indigo-200 font-medium">⚡ $1</div>')
      // Quotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-indigo-500 pl-3 my-1.5 text-xs italic text-slate-600 dark:text-slate-300">$1</blockquote>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code tags
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">$1</code>')
      // Unordered lists
      .replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-slate-700 dark:text-slate-300 my-0.5">$1</li>')
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-xs text-slate-700 dark:text-slate-300 my-0.5">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br>');

    return html;
  }

  // Text-To-Speech helper
  function speakText(text, btnElement) {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported by your current browser.");
      return;
    }

    if (state.ttsSpeaking) {
      window.speechSynthesis.cancel();
      state.ttsSpeaking = false;
      if (btnElement) btnElement.classList.remove("text-indigo-600", "audio-pulse");
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*#>`_]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .slice(0, 800); // speak up to ~800 chars

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      state.ttsSpeaking = true;
      if (btnElement) btnElement.classList.add("text-indigo-600", "audio-pulse");
    };

    utterance.onend = utterance.onerror = () => {
      state.ttsSpeaking = false;
      if (btnElement) btnElement.classList.remove("text-indigo-600", "audio-pulse");
    };

    window.speechSynthesis.speak(utterance);
  }

  // Save insight to study notes
  function saveToStudyNotes(text, moduleId) {
    try {
      const key = `psych_notes_${moduleId}`;
      const existing = localStorage.getItem(key) || "";
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const cleanSnippet = text.replace(/<[^>]+>/g, "").slice(0, 400);
      const entry = `\n\n--- 🤖 DeepTutor Insight (${timestamp}) ---\n${cleanSnippet}`;

      localStorage.setItem(key, existing + entry);

      // Trigger DOM update if scratchpad is available
      const textarea = document.getElementById("scratchpad-textarea");
      if (textarea) {
        textarea.value = existing + entry;
        const charCount = document.getElementById("scratchpad-char-count");
        if (charCount) charCount.textContent = `${textarea.value.length} characters`;
      }

      if (typeof window.showToast === "function") {
        window.showToast("Saved insight to Study Notes!", "success");
      } else {
        alert("Saved insight to Study Notes!");
      }
    } catch (e) {
      console.error("Failed to save to notes", e);
    }
  }

  // Render the DeepTutor Workspace inside any container
  function renderWorkspace(container, moduleId, options = {}) {
    state.currentModuleId = moduleId;
    loadConfig();

    const isModal = options.isModal || false;
    const mod = (typeof PSYCH_DATA !== 'undefined' && PSYCH_DATA.modules)
      ? PSYCH_DATA.modules.find(m => m.id === moduleId)
      : null;
    const modTitle = mod ? `Module ${mod.number}: ${mod.title}` : "Psychology 101";

    container.innerHTML = `
      <div class="deeptutor-container flex flex-col h-full w-full bg-white dark:bg-slate-900 ${isModal ? "" : "rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[580px]"}">
        
        <!-- Top Toolbar & Status -->
        <div class="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-violet-500/20 flex-shrink-0">
              🤖
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">DeepTutor AI</span>
                <span id="dt-engine-badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  state.config.provider === "offline" 
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80" 
                    : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800/80"
                }">
                  ${state.config.provider === "offline" ? "⚡ Offline Engine" : "🚀 " + state.config.provider.toUpperCase()}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px] sm:max-w-md">
                Grounded in: <strong class="text-slate-700 dark:text-slate-300">${modTitle}</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Memory Inspector Button -->
            <button id="dt-btn-memory" title="Inspect Student Memory & Weak Spots" class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>🧠</span>
              <span class="hidden sm:inline">Memory</span>
            </button>

            <!-- Provider Settings Button -->
            <button id="dt-btn-settings" title="Configure Engine (Groq, Gemini, Ollama, Offline)" class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer">
              <span>⚙️</span>
              <span class="hidden sm:inline">Settings</span>
            </button>

            <!-- Clear Chat Button -->
            <button id="dt-btn-clear" title="Clear Chat History" class="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

        <!-- Mode Selector Bar -->
        <div class="px-3 sm:px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 flex-shrink-0">Mode:</span>
          
          <button data-mode="socratic" class="dt-mode-btn px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${state.activeMode === 'socratic' ? 'bg-violet-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
            <span>🧠 Socratic Dialogue</span>
          </button>
          <button data-mode="analogy" class="dt-mode-btn px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${state.activeMode === 'analogy' ? 'bg-violet-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
            <span>💡 Analogy Explainer</span>
          </button>
          <button data-mode="clash" class="dt-mode-btn px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${state.activeMode === 'clash' ? 'bg-violet-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
            <span>⚔️ Concept Clash</span>
          </button>
          <button data-mode="drill" class="dt-mode-btn px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${state.activeMode === 'drill' ? 'bg-violet-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
            <span>🎯 Socratic Drill</span>
          </button>
          <button data-mode="case" class="dt-mode-btn px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer ${state.activeMode === 'case' ? 'bg-violet-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}">
            <span>🩺 Case Clinic</span>
          </button>
        </div>

        <!-- Chat Stream Messages Container -->
        <div id="dt-chat-stream" class="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] sm:max-h-[520px]">
          <!-- Message history rendered here -->
        </div>

        <!-- Quick Suggestions Chips Bar -->
        <div class="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <span class="text-slate-400 dark:text-slate-500 font-semibold flex-shrink-0">Ask:</span>
          <button class="dt-chip px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors whitespace-nowrap cursor-pointer">
            💡 Explain with an analogy
          </button>
          <button class="dt-chip px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors whitespace-nowrap cursor-pointer">
            ⚔️ What are the biggest exam traps here?
          </button>
          <button class="dt-chip px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors whitespace-nowrap cursor-pointer">
            🎯 Test me on my weak spots
          </button>
          <button class="dt-chip px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors whitespace-nowrap cursor-pointer">
            🩺 Give me a clinical case study
          </button>
        </div>

        <!-- Chat Input Form -->
        <form id="dt-chat-form" class="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-end gap-2">
          <div class="relative flex-1">
            <textarea 
              id="dt-chat-input" 
              rows="1" 
              placeholder="Ask DeepTutor a question, request an analogy, or type your answer..." 
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-violet-500 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-slate-900 dark:text-white placeholder-slate-400 max-h-32 transition-all"></textarea>
          </div>
          
          <button 
            type="submit" 
            id="dt-btn-send" 
            class="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm shadow-violet-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer h-[42px]">
            <span>Send</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>

      </div>
    `;

    const chatStream = container.querySelector("#dt-chat-stream");
    const chatInput = container.querySelector("#dt-chat-input");
    const chatForm = container.querySelector("#dt-chat-form");
    const sendBtn = container.querySelector("#dt-btn-send");

    // Render initial message history
    renderMessages(chatStream, moduleId);

    // Auto-resize textarea
    chatInput.addEventListener("input", () => {
      chatInput.style.height = "auto";
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
    });

    // Enter to submit (Shift+Enter for newline)
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event("submit"));
      }
    });

    // Form submit
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = chatInput.value.trim();
      if (!query || state.isGenerating) return;

      chatInput.value = "";
      chatInput.style.height = "auto";
      sendMessage(query, moduleId, chatStream);
    });

    // Mode button toggles
    container.querySelectorAll(".dt-mode-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".dt-mode-btn").forEach(b => {
          b.className = "dt-mode-btn px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200";
        });
        btn.className = "dt-mode-btn px-2.5 py-1 rounded-xl font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer bg-violet-600 text-white shadow-xs";
        state.activeMode = btn.dataset.mode;

        // Auto trigger prompt based on selected mode
        if (state.activeMode === "analogy") {
          sendMessage("Explain the core mechanism of this module with a vivid analogy.", moduleId, chatStream);
        } else if (state.activeMode === "clash") {
          sendMessage("Show me the biggest concept clash or contrasting pairs for this module.", moduleId, chatStream);
        } else if (state.activeMode === "drill") {
          sendMessage("Give me a diagnostic Socratic drill question to test my understanding.", moduleId, chatStream);
        } else if (state.activeMode === "case") {
          sendMessage("Present a clinical case study for this module.", moduleId, chatStream);
        }
      });
    });

    // Chip triggers
    container.querySelectorAll(".dt-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const text = chip.textContent.replace(/^[💡⚔️🎯🩺]\s*/, "").trim();
        sendMessage(text, moduleId, chatStream);
      });
    });

    // Clear history
    container.querySelector("#dt-btn-clear")?.addEventListener("click", () => {
      if (confirm("Clear your conversation history with DeepTutor for this module?")) {
        state.chatHistories[moduleId] = [];
        renderMessages(chatStream, moduleId);
      }
    });

    // Memory modal trigger
    container.querySelector("#dt-btn-memory")?.addEventListener("click", () => {
      openMemoryModal(moduleId);
    });

    // Settings modal trigger
    container.querySelector("#dt-btn-settings")?.addEventListener("click", () => {
      openSettingsModal(() => {
        // Callback on settings save
        const badge = container.querySelector("#dt-engine-badge");
        if (badge) {
          badge.textContent = state.config.provider === "offline" ? "⚡ Offline Engine" : "🚀 " + state.config.provider.toUpperCase();
          badge.className = `px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            state.config.provider === "offline" 
              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80" 
              : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800/80"
          }`;
        }
      });
    });
  }

  // Render chat messages inside container
  function renderMessages(streamEl, moduleId) {
    const history = getHistory(moduleId);
    streamEl.innerHTML = "";

    history.forEach((msg, idx) => {
      const isUser = msg.role === "user";
      const bubble = document.createElement("div");
      bubble.className = `flex gap-3 ${isUser ? "justify-end" : "justify-start"} fade-in`;

      if (isUser) {
        bubble.innerHTML = `
          <div class="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-violet-600 text-white px-4 py-2.5 text-xs sm:text-sm shadow-sm">
            <p class="whitespace-pre-wrap leading-relaxed">${msg.content}</p>
          </div>
        `;
      } else {
        bubble.innerHTML = `
          <div class="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
            Ψ
          </div>
          <div class="max-w-[90%] sm:max-w-[85%] rounded-2xl rounded-tl-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-3.5 sm:p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-100 shadow-sm leading-relaxed space-y-2">
            <div class="dt-msg-content">${formatMarkdown(msg.content)}</div>
            
            <!-- Message Action Toolbar -->
            <div class="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span class="text-[10px] uppercase font-bold text-slate-400">DeepTutor &bull; ${msg.mode || 'Socratic'}</span>
              
              <div class="flex items-center gap-2">
                <!-- TTS Audio Button -->
                <button class="dt-btn-tts hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer" title="Read Aloud">
                  <span>🔊</span>
                  <span class="hidden sm:inline">Listen</span>
                </button>

                <!-- Copy to Study Notes -->
                <button class="dt-btn-notes hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer" title="Save this explanation to your movable study notes">
                  <span>📝</span>
                  <span class="hidden sm:inline">Save to Notes</span>
                </button>
              </div>
            </div>
          </div>
        `;

        // Bind audio & notes buttons
        const ttsBtn = bubble.querySelector(".dt-btn-tts");
        ttsBtn?.addEventListener("click", () => {
          speakText(msg.content, ttsBtn);
        });

        const notesBtn = bubble.querySelector(".dt-btn-notes");
        notesBtn?.addEventListener("click", () => {
          saveToStudyNotes(msg.content, moduleId);
        });
      }

      streamEl.appendChild(bubble);
    });

    streamEl.scrollTop = streamEl.scrollHeight;
  }

  // Send message controller
  async function sendMessage(query, moduleId, streamEl) {
    if (state.isGenerating) return;
    state.isGenerating = true;

    // 1. Append user message
    const history = getHistory(moduleId);
    history.push({
      role: "user",
      content: query,
      timestamp: Date.now()
    });
    renderMessages(streamEl, moduleId);

    // 2. Append assistant placeholder bubble
    const assistantBubble = document.createElement("div");
    assistantBubble.className = "flex gap-3 justify-start fade-in";
    assistantBubble.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
        Ψ
      </div>
      <div class="max-w-[90%] sm:max-w-[85%] rounded-2xl rounded-tl-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 p-3.5 sm:p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-100 shadow-sm leading-relaxed space-y-2">
        <div class="dt-msg-content flex items-center gap-1.5 text-slate-400 italic">
          <span class="animate-pulse">DeepTutor is formulating Socratic response...</span>
        </div>
      </div>
    `;
    streamEl.appendChild(assistantBubble);
    streamEl.scrollTop = streamEl.scrollHeight;

    const contentDiv = assistantBubble.querySelector(".dt-msg-content");

    const onChunk = (chunk, currentFull) => {
      contentDiv.innerHTML = formatMarkdown(currentFull);
      streamEl.scrollTop = streamEl.scrollHeight;
    };

    const onDone = (finalText) => {
      state.isGenerating = false;
      history.push({
        role: "assistant",
        mode: state.activeMode,
        content: finalText,
        timestamp: Date.now()
      });
      renderMessages(streamEl, moduleId);
    };

    const onError = (err) => {
      state.isGenerating = false;
      console.warn("Live API error, falling back to Offline Socratic Engine:", err);
      // Auto fallback to offline
      const offlineText = generateOfflineResponse(query, moduleId, state.activeMode);
      onDone(
        `> [!TIP]\n> **Notice:** Live provider returned an issue (*${err.message}*). DeepTutor seamlessly switched to the **Built-in Offline Socratic Engine** to answer:\n\n` + 
        offlineText
      );
    };

    // Route to Engine
    if (state.config.provider === "offline") {
      const offlineText = generateOfflineResponse(query, moduleId, state.activeMode);
      simulateOfflineStream(offlineText, onChunk, onDone);
    } else {
      generateLiveResponse(query, moduleId, state.activeMode, onChunk, onDone, onError);
    }
  }

  // ==========================================
  // 7. SETTINGS & MEMORY MODALS
  // ==========================================

  function openSettingsModal(onSaveCallback) {
    let modal = document.getElementById("modal-dt-settings");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-dt-settings";
      modal.className = "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm";
      document.body.appendChild(modal);
    }

    const cfg = state.config;

    modal.innerHTML = `
      <div class="modal-enter bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        <!-- Header -->
        <div class="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-violet-500/20">
              ⚙️
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white">DeepTutor Engine Settings</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Zero-billing offline heuristics or free live AI</p>
            </div>
          </div>
          <button id="dt-settings-close" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          
          <!-- Engine Selection Radio Group -->
          <div>
            <label class="block font-bold text-slate-900 dark:text-white mb-2">Select Active Tutor Engine:</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <!-- Offline (Default) -->
              <label class="dt-provider-card flex items-start gap-2.5 p-3 rounded-2xl border ${cfg.provider === 'offline' ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/40 ring-2 ring-violet-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} cursor-pointer">
                <input type="radio" name="dt_provider" value="offline" ${cfg.provider === 'offline' ? 'checked' : ''} class="mt-0.5 text-violet-600">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>⚡ Built-in Offline</span>
                    <span class="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">100% Free</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">0 API keys, 0 billing, works anywhere completely offline.</p>
                </div>
              </label>

              <!-- Groq Cloud (Free) -->
              <label class="dt-provider-card flex items-start gap-2.5 p-3 rounded-2xl border ${cfg.provider === 'groq' ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/40 ring-2 ring-violet-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} cursor-pointer">
                <input type="radio" name="dt_provider" value="groq" ${cfg.provider === 'groq' ? 'checked' : ''} class="mt-0.5 text-violet-600">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🚀 Groq Cloud</span>
                    <span class="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold">Free Tier</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ultra-fast Llama 3.3 70B. Free API key from console.groq.com (no card).</p>
                </div>
              </label>

              <!-- Google AI Studio (Gemini) -->
              <label class="dt-provider-card flex items-start gap-2.5 p-3 rounded-2xl border ${cfg.provider === 'gemini' ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/40 ring-2 ring-violet-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} cursor-pointer">
                <input type="radio" name="dt_provider" value="gemini" ${cfg.provider === 'gemini' ? 'checked' : ''} class="mt-0.5 text-violet-600">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>✨ Google Gemini</span>
                    <span class="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.2 rounded font-bold">AI Studio</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Gemini 2.0 Flash via free key from aistudio.google.com.</p>
                </div>
              </label>

              <!-- Local Ollama -->
              <label class="dt-provider-card flex items-start gap-2.5 p-3 rounded-2xl border ${cfg.provider === 'ollama' ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/40 ring-2 ring-violet-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} cursor-pointer">
                <input type="radio" name="dt_provider" value="ollama" ${cfg.provider === 'ollama' ? 'checked' : ''} class="mt-0.5 text-violet-600">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>🦙 Local Ollama</span>
                    <span class="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">Localhost</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Connect to your local Ollama server (qwen2.5, llama3.2).</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Dynamic Provider Configuration Fields -->
          <div id="dt-provider-fields" class="space-y-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <!-- Rendered dynamically -->
          </div>

          <!-- Test Connection Status Box -->
          <div id="dt-test-result" class="hidden p-3 rounded-xl text-xs font-semibold"></div>
        </div>

        <!-- Footer -->
        <div class="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
          <button id="dt-btn-test-conn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer">
            <span>⚡ Test Connection</span>
          </button>
          
          <div class="flex items-center gap-2">
            <button id="dt-settings-cancel" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              Cancel
            </button>
            <button id="dt-settings-save" class="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 active:scale-95 text-white shadow-sm shadow-violet-500/20 transition-all cursor-pointer">
              Save Settings
            </button>
          </div>
        </div>

      </div>
    `;

    modal.classList.remove("hidden");

    const fieldsContainer = modal.querySelector("#dt-provider-fields");
    const testResultBox = modal.querySelector("#dt-test-result");

    function updateFieldsView(selectedProvider) {
      if (selectedProvider === "offline") {
        fieldsContainer.innerHTML = `
          <div class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p class="font-bold text-emerald-600 dark:text-emerald-400 mb-1">✅ Offline Socratic Engine Active</p>
            The built-in engine uses pre-indexed academic psychology schemas, analogies, concept clashes, and clinical cases spanning all 8 modules. No external keys or payment credentials needed.
          </div>
        `;
      } else if (selectedProvider === "groq") {
        fieldsContainer.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">Groq API Key:</label>
              <a href="https://console.groq.com/keys" target="_blank" class="text-[11px] text-violet-600 dark:text-violet-400 hover:underline">Get Free Key (console.groq.com) &rarr;</a>
            </div>
            <input type="password" id="dt-groq-key" value="${cfg.groqKey || ''}" placeholder="gsk_..." class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:outline-none">
          </div>
          <div class="mt-2.5">
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Model:</label>
            <select id="dt-groq-model" class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:outline-none">
              <option value="llama-3.3-70b-versatile" ${cfg.groqModel === 'llama-3.3-70b-versatile' ? 'selected' : ''}>llama-3.3-70b-versatile (Recommended - Smarter)</option>
              <option value="llama-3.1-8b-instant" ${cfg.groqModel === 'llama-3.1-8b-instant' ? 'selected' : ''}>llama-3.1-8b-instant (Fastest)</option>
            </select>
          </div>
        `;
      } else if (selectedProvider === "gemini") {
        fieldsContainer.innerHTML = `
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">Google Gemini API Key:</label>
              <a href="https://aistudio.google.com/" target="_blank" class="text-[11px] text-violet-600 dark:text-violet-400 hover:underline">Get Free Key (aistudio.google.com) &rarr;</a>
            </div>
            <input type="password" id="dt-gemini-key" value="${cfg.geminiKey || ''}" placeholder="AIzaSy..." class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:outline-none">
          </div>
          <div class="mt-2.5">
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Model:</label>
            <select id="dt-gemini-model" class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:outline-none">
              <option value="gemini-2.0-flash" ${cfg.geminiModel === 'gemini-2.0-flash' ? 'selected' : ''}>gemini-2.0-flash (Recommended)</option>
              <option value="gemini-1.5-flash" ${cfg.geminiModel === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash</option>
            </select>
          </div>
        `;
      } else if (selectedProvider === "ollama") {
        fieldsContainer.innerHTML = `
          <div>
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Ollama Localhost URL:</label>
            <input type="text" id="dt-ollama-url" value="${cfg.ollamaUrl || 'http://localhost:11434'}" class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:outline-none font-mono">
          </div>
          <div class="mt-2.5">
            <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Model Name:</label>
            <input type="text" id="dt-ollama-model" value="${cfg.ollamaModel || 'qwen2.5:3b'}" placeholder="qwen2.5:3b or llama3.2:3b" class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-violet-500 focus:outline-none font-mono">
          </div>
        `;
      }
    }

    let currentSelectedProvider = cfg.provider;
    updateFieldsView(currentSelectedProvider);

    // Radio change listeners
    modal.querySelectorAll("input[name='dt_provider']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        currentSelectedProvider = e.target.value;
        modal.querySelectorAll(".dt-provider-card").forEach(c => {
          c.className = "dt-provider-card flex items-start gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer";
        });
        e.target.closest(".dt-provider-card").className = "dt-provider-card flex items-start gap-2.5 p-3 rounded-2xl border border-violet-500 bg-violet-50/40 dark:bg-violet-950/40 ring-2 ring-violet-500 cursor-pointer";
        updateFieldsView(currentSelectedProvider);
      });
    });

    // Test connection action
    modal.querySelector("#dt-btn-test-conn")?.addEventListener("click", async () => {
      testResultBox.classList.remove("hidden", "bg-emerald-50", "text-emerald-700", "bg-rose-50", "text-rose-700");
      testResultBox.classList.add("bg-indigo-50", "text-indigo-700");
      testResultBox.textContent = "Testing connection...";

      let key = "";
      let model = "";
      let url = "";

      if (currentSelectedProvider === "groq") {
        key = modal.querySelector("#dt-groq-key")?.value.trim() || "";
        model = modal.querySelector("#dt-groq-model")?.value || "";
      } else if (currentSelectedProvider === "gemini") {
        key = modal.querySelector("#dt-gemini-key")?.value.trim() || "";
        model = modal.querySelector("#dt-gemini-model")?.value || "";
      } else if (currentSelectedProvider === "ollama") {
        url = modal.querySelector("#dt-ollama-url")?.value.trim() || "";
        model = modal.querySelector("#dt-ollama-model")?.value.trim() || "";
      }

      const res = await testConnection(currentSelectedProvider, key, model, url);
      testResultBox.classList.remove("bg-indigo-50", "text-indigo-700");

      if (res.success) {
        testResultBox.classList.add("bg-emerald-50", "text-emerald-700", "dark:bg-emerald-950", "dark:text-emerald-300");
        testResultBox.textContent = "✅ " + res.message;
      } else {
        testResultBox.classList.add("bg-rose-50", "text-rose-700", "dark:bg-rose-950", "dark:text-rose-300");
        testResultBox.textContent = "❌ " + res.message;
      }
    });

    // Close actions
    const closeModal = () => modal.classList.add("hidden");
    modal.querySelector("#dt-settings-close")?.addEventListener("click", closeModal);
    modal.querySelector("#dt-settings-cancel")?.addEventListener("click", closeModal);

    // Save action
    modal.querySelector("#dt-settings-save")?.addEventListener("click", () => {
      const updated = { provider: currentSelectedProvider };

      if (currentSelectedProvider === "groq") {
        updated.groqKey = modal.querySelector("#dt-groq-key")?.value.trim() || "";
        updated.groqModel = modal.querySelector("#dt-groq-model")?.value || "llama-3.3-70b-versatile";
      } else if (currentSelectedProvider === "gemini") {
        updated.geminiKey = modal.querySelector("#dt-gemini-key")?.value.trim() || "";
        updated.geminiModel = modal.querySelector("#dt-gemini-model")?.value || "gemini-2.0-flash";
      } else if (currentSelectedProvider === "ollama") {
        updated.ollamaUrl = modal.querySelector("#dt-ollama-url")?.value.trim() || "http://localhost:11434";
        updated.ollamaModel = modal.querySelector("#dt-ollama-model")?.value.trim() || "qwen2.5:3b";
      }

      saveConfig(updated);
      closeModal();
      if (typeof onSaveCallback === "function") onSaveCallback();
      if (typeof window.showToast === "function") window.showToast("DeepTutor engine settings saved!", "success");
    });
  }

  // Open Student Memory Modal
  function openMemoryModal(moduleId) {
    let modal = document.getElementById("modal-dt-memory");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-dt-memory";
      modal.className = "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm";
      document.body.appendChild(modal);
    }

    const memory = getStudentMemorySummary(moduleId);
    const mod = (typeof PSYCH_DATA !== 'undefined' && PSYCH_DATA.modules)
      ? PSYCH_DATA.modules.find(m => m.id === moduleId)
      : null;
    const modTitle = mod ? mod.title : "Current Module";

    modal.innerHTML = `
      <div class="modal-enter bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-violet-500/20">
              🧠
            </div>
            <div>
              <h3 class="text-base font-extrabold text-slate-900 dark:text-white">Student Mastery Profile</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">DeepTutor's inspectable understanding of your progress</p>
            </div>
          </div>
          <button id="dt-memory-close" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          <div class="p-3.5 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60">
            <span class="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block mb-1">Current Target Domain</span>
            <div class="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">${modTitle}</div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span class="text-slate-500 text-[11px] block">Flashcard Mastery:</span>
              <div class="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">${memory.masteredCount} Mastered</div>
              <span class="text-[11px] text-slate-400">${memory.dueCount} terms still due</span>
            </div>

            <div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span class="text-slate-500 text-[11px] block">Practice Quiz Best:</span>
              <div class="text-lg font-black ${memory.quizScore >= 3 ? 'text-emerald-600' : 'text-amber-600'} mt-1">
                ${memory.quizScore !== null ? `${memory.quizScore} / 5 Correct` : "Not attempted yet"}
              </div>
              <span class="text-[11px] text-slate-400">${memory.quizScore >= 3 ? "Pass mark unlocked" : "Score 3+ to master"}</span>
            </div>
          </div>

          <!-- Identified Weak Spots -->
          <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <h5 class="font-bold text-slate-900 dark:text-white text-xs mb-2 flex items-center gap-1.5">
              <span>🎯 Recommended Focus Concepts:</span>
            </h5>
            ${memory.weakTerms.length > 0 ? `
              <div class="flex flex-wrap gap-1.5">
                ${memory.weakTerms.map(t => `<span class="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold text-xs">${t}</span>`).join("")}
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2">These concepts have not yet been flagged as easy or retained in active recall.</p>
            ` : `
              <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">🎉 All core terms in this module are currently classified as mastered!</p>
            `}
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex justify-end">
          <button id="dt-memory-dismiss" class="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer">
            Got it
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    const close = () => modal.classList.add("hidden");
    modal.querySelector("#dt-memory-close")?.addEventListener("click", close);
    modal.querySelector("#dt-memory-dismiss")?.addEventListener("click", close);
  }

  // Global DeepTutor Modal Launcher
  function openGlobalModal(moduleId) {
    let modal = document.getElementById("modal-deeptutor");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-deeptutor";
      modal.className = "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/70 backdrop-blur-sm";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-enter bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full h-[90vh] sm:h-[82vh] flex flex-col overflow-hidden">
        <!-- Close Button Header Bar -->
        <div class="p-2 sm:p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div class="flex items-center gap-2 pl-2">
            <span class="text-base">🤖</span>
            <span class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">DeepTutor Socratic Workspace</span>
          </div>
          <button id="modal-deeptutor-close" class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div id="modal-deeptutor-body" class="flex-1 overflow-hidden">
          <!-- Rendered by renderWorkspace -->
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    const bodyEl = modal.querySelector("#modal-deeptutor-body");
    renderWorkspace(bodyEl, moduleId, { isModal: true });

    modal.querySelector("#modal-deeptutor-close")?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  // Public API
  return {
    state,
    loadConfig,
    saveConfig,
    renderWorkspace,
    openGlobalModal,
    openSettingsModal,
    openMemoryModal,
    formatMarkdown,
    testConnection
  };
}));
