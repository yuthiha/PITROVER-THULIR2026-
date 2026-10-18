/**
 * SELF-FLUIDIZING MOTHER-DAUGHTER DESLUDGING SYSTEM
 * Interactive Engineering Visualizations & Mechatronic Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initPCPumpCanvas();
  initIntelligentControlSequence();
  initSchematicInspector();
  initModeSwitcher();
  initAlarmSimulator();
  initWorkflowStepper();
  initBusinessCalculator();
  initHotspotModal();
  initSpecsFilter();
});

/* --------------------------------------------------------------------------
   1. Navigation & Scroll Spy
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const navToggleBtn = document.querySelector('.nav-toggle-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  if (navToggleBtn && mobileDrawer) {
    navToggleBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      navToggleBtn.setAttribute('aria-expanded', isOpen);
      navToggleBtn.innerHTML = isOpen 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });

    mobileDrawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        navToggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
      });
    });
  }
}

/* --------------------------------------------------------------------------
   2. Progressive Cavity Pump Canvas Animation
   -------------------------------------------------------------------------- */
function initPCPumpCanvas() {
  const canvas = document.getElementById('pc-pump-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let isPlaying = true;
  let phase = 0;
  let speed = 0.05;

  const toggleBtn = document.getElementById('pc-canvas-toggle');
  const speedBtn = document.getElementById('pc-canvas-speed');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', resize);

  // Sludge particles
  const particles = [];
  for (let i = 0; i < 45; i++) {
    particles.push({
      x: Math.random() * 0.9,
      y: 0.5 + (Math.random() - 0.5) * 0.25,
      size: 3 + Math.random() * 4,
      speed: 0.003 + Math.random() * 0.002
    });
  }

  function draw() {
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;
    ctx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const statorStartX = width * 0.28;
    const statorEndX = width * 0.78;
    const statorLength = statorEndX - statorStartX;
    const statorRadius = 38;

    // 1. Draw Stator Housing (Elastomer double-helix envelope)
    ctx.fillStyle = '#111E2E';
    ctx.strokeStyle = '#1E3A5F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(statorStartX - 10, centerY - statorRadius - 12, statorLength + 20, statorRadius * 2 + 24, 6);
    ctx.fill();
    ctx.stroke();

    // Elastomer stator interior pattern
    ctx.strokeStyle = 'rgba(13, 148, 136, 0.4)';
    ctx.lineWidth = 2;
    for (let x = statorStartX; x <= statorEndX; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, centerY - statorRadius);
      ctx.lineTo(x + 10, centerY - statorRadius - 8);
      ctx.moveTo(x, centerY + statorRadius);
      ctx.lineTo(x + 10, centerY + statorRadius + 8);
      ctx.stroke();
    }

    // 2. Draw Progressing Cavities (Trapped Sludge Volume)
    ctx.fillStyle = 'rgba(234, 88, 12, 0.28)';
    ctx.beginPath();
    for (let x = statorStartX; x <= statorEndX; x += 3) {
      const prog = (x - statorStartX) / 45;
      const topWave = centerY - statorRadius + Math.sin(prog + phase) * 14;
      if (x === statorStartX) ctx.moveTo(x, topWave);
      else ctx.lineTo(x, topWave);
    }
    for (let x = statorEndX; x >= statorStartX; x -= 3) {
      const prog = (x - statorStartX) / 45;
      const bottomWave = centerY + statorRadius - Math.cos(prog + phase) * 14;
      ctx.lineTo(x, bottomWave);
    }
    ctx.closePath();
    ctx.fill();

    // 3. Draw Moving Sludge Particles along progressing cavities
    particles.forEach(p => {
      p.x += p.speed;
      if (p.x > 0.95) p.x = 0.05;

      const px = width * p.x;
      let py = centerY;

      if (px < statorStartX) {
        // Inlet zone
        py = centerY + Math.sin(p.x * 20 + phase) * 15;
        ctx.fillStyle = '#64748B';
      } else if (px <= statorEndX) {
        // Inside moving cavity
        const waveProg = (px - statorStartX) / 45;
        py = centerY + Math.sin(waveProg + phase) * 16;
        ctx.fillStyle = '#EA580C';
      } else {
        // High pressure discharge
        py = centerY - 15 - (px - statorEndX) * 0.4;
        ctx.fillStyle = '#F97316';
      }

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Draw Rotating Helical Metallic Rotor (Chrome single helix)
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = statorStartX - 25; x <= statorEndX + 15; x += 4) {
      const waveProg = (x - statorStartX) / 45;
      const rotorY = centerY + Math.sin(waveProg + phase) * 18;
      if (x === statorStartX - 25) ctx.moveTo(x, rotorY);
      else ctx.lineTo(x, rotorY);
    }
    ctx.stroke();

    // Rotor metallic highlight
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = statorStartX - 20; x <= statorEndX + 10; x += 4) {
      const waveProg = (x - statorStartX) / 45;
      const rotorY = centerY + Math.sin(waveProg + phase) * 18 - 2;
      if (x === statorStartX - 20) ctx.moveTo(x, rotorY);
      else ctx.lineTo(x, rotorY);
    }
    ctx.stroke();

    // 5. Suction Inlet Port (Left)
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0D9488';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(width * 0.12, centerY - 28, width * 0.14, 56, 4);
    ctx.fill();
    ctx.stroke();

    // Directional arrows
    ctx.fillStyle = '#0D9488';
    ctx.font = '600 11px JetBrains Mono';
    ctx.fillText('SUCTION INLET →', width * 0.13, centerY + 4);

    // 6. Discharge Outlet Port (Right)
    ctx.beginPath();
    ctx.roundRect(statorEndX + 8, centerY - 32, width * 0.14, 64, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#EA580C';
    ctx.fillText('DISCHARGE →', statorEndX + 16, centerY + 4);

    if (isPlaying) {
      phase += speed;
    }
    animationFrameId = requestAnimationFrame(draw);
  }

  draw();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      toggleBtn.textContent = isPlaying ? '❚❚ Pause Animation' : '► Resume Animation';
      toggleBtn.classList.toggle('active', isPlaying);
    });
  }

  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      speed = speed === 0.05 ? 0.1 : (speed === 0.1 ? 0.025 : 0.05);
      speedBtn.textContent = speed === 0.05 ? 'Speed: 1x' : (speed === 0.1 ? 'Speed: 2x' : 'Speed: 0.5x');
    });
  }
}

/* --------------------------------------------------------------------------
   3. Intelligent Pump Control Operating Sequence Simulator
   -------------------------------------------------------------------------- */
const controlSequenceData = {
  normal: {
    stepNum: 'STATE 01',
    name: 'Normal Pumping',
    current: '14.5 A',
    currentPct: 45,
    pressure: '3.2 Bar',
    pressurePct: 35,
    flow: '28.1 L/min',
    flowPct: 80,
    rpm: '1,120 RPM',
    rpmPct: 85,
    bypass: '15% Open',
    bypassPct: 15,
    statusText: '<strong>Normal Pumping:</strong> Fluid viscosity within expected limits. The microcontroller maintains optimal pump RPM while supplying 15% bypass liquid to the self-fluidizing jet nozzle.',
    statusClass: 'status-normal',
    statusColor: '#0D9488'
  },
  resistance: {
    stepNum: 'STATE 02',
    name: 'Increased Resistance Detected',
    current: '19.8 A',
    currentPct: 75,
    pressure: '5.4 Bar',
    pressurePct: 65,
    flow: '18.4 L/min',
    flowPct: 52,
    rpm: '780 RPM',
    rpmPct: 60,
    bypass: '45% Open',
    bypassPct: 45,
    statusText: '<strong>Increased Resistance Detected:</strong> Thick sludge cake entry causes a rise in motor current and discharge pressure. Control loop automatically throttles pump RPM down and expands jet bypass to 45% to liquefy solids.',
    statusClass: 'status-resistance',
    statusColor: '#D97706'
  },
  blockage: {
    stepNum: 'STATE 03',
    name: 'Obstruction / Safe Backflush',
    current: '24.2 A',
    currentPct: 92,
    pressure: '7.2 Bar',
    pressurePct: 90,
    flow: '4.8 L/min',
    flowPct: 15,
    rpm: '420 RPM',
    rpmPct: 32,
    bypass: '85% Open',
    bypassPct: 85,
    statusText: '<strong>High Pressure / Low Flow Condition:</strong> Foreign debris or severe rag entanglement detected. Microcontroller activates automated reverse-flow backflush sequence to clear intake cage safely.',
    statusClass: 'status-blockage',
    statusColor: '#EA580C'
  },
  dryrun: {
    stepNum: 'STATE 04',
    name: 'Loss of Flow / Automatic Shutdown',
    current: '7.4 A',
    currentPct: 20,
    pressure: '0.2 Bar',
    pressurePct: 5,
    flow: '0.0 L/min',
    flowPct: 0,
    rpm: '0 RPM',
    rpmPct: 0,
    bypass: '0% Closed',
    bypassPct: 0,
    statusText: '<strong>Loss of Flow / Dry-Running Tripped:</strong> Flow dropped to zero under low pressure, indicating pit depletion or air breach. Pump motor instantly stopped to prevent irreversible stator burnout.',
    statusClass: 'status-shutdown',
    statusColor: '#DC2626'
  }
};

function initIntelligentControlSequence() {
  const navBtns = document.querySelectorAll('.sequence-nav-btn');
  const autoBtn = document.getElementById('sequence-auto-btn');
  const statusBanner = document.getElementById('sequence-status-banner');

  const valCurrent = document.getElementById('tel-val-current');
  const barCurrent = document.getElementById('tel-bar-current');
  const valPressure = document.getElementById('tel-val-pressure');
  const barPressure = document.getElementById('tel-bar-pressure');
  const valFlow = document.getElementById('tel-val-flow');
  const barFlow = document.getElementById('tel-bar-flow');
  const valRpm = document.getElementById('tel-val-rpm');
  const barRpm = document.getElementById('tel-bar-rpm');
  const valBypass = document.getElementById('tel-val-bypass');
  const barBypass = document.getElementById('tel-bar-bypass');

  if (!navBtns.length || !valCurrent) return;

  let autoInterval = null;
  const sequenceKeys = ['normal', 'resistance', 'blockage', 'dryrun'];
  let currentIndex = 0;

  function setSequenceState(key) {
    const data = controlSequenceData[key];
    if (!data) return;

    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.step === key);
    });

    valCurrent.textContent = data.current;
    barCurrent.style.width = data.currentPct + '%';
    barCurrent.style.backgroundColor = data.statusColor;

    valPressure.textContent = data.pressure;
    barPressure.style.width = data.pressurePct + '%';
    barPressure.style.backgroundColor = data.statusColor;

    valFlow.textContent = data.flow;
    barFlow.style.width = data.flowPct + '%';
    barFlow.style.backgroundColor = data.statusColor;

    valRpm.textContent = data.rpm;
    barRpm.style.width = data.rpmPct + '%';

    valBypass.textContent = data.bypass;
    barBypass.style.width = data.bypassPct + '%';

    statusBanner.innerHTML = data.statusText;
    statusBanner.style.borderLeftColor = data.statusColor;
    statusBanner.style.backgroundColor = data.statusColor + '18';
  }

  navBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        if (autoBtn) autoBtn.textContent = '▶ Auto Sequence';
      }
      currentIndex = idx;
      setSequenceState(btn.dataset.step);
    });
  });

  if (autoBtn) {
    autoBtn.addEventListener('click', () => {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        autoBtn.textContent = '▶ Auto Sequence';
      } else {
        autoBtn.textContent = '❚❚ Stop Sequence';
        autoInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % sequenceKeys.length;
          setSequenceState(sequenceKeys[currentIndex]);
        }, 3200);
      }
    });
  }

  // Default to normal
  setSequenceState('normal');
}

/* --------------------------------------------------------------------------
   4. Interactive System Architecture Schematic Inspector
   -------------------------------------------------------------------------- */
const schematicData = {
  tank: {
    title: 'Household Septic Tank / Pit',
    type: 'Sludge Source',
    desc: 'Domestic underground containment holding settled faecal solids, supernatant liquid, and scum layers.',
    details: 'Supernatant liquid is utilized directly by the intake probe, avoiding the need for external fluidization water.',
    status: 'In-Pit Fluid Reservoir'
  },
  station: {
    title: 'Freestanding Tripod Station & Flexible Skirt',
    type: 'Mechanical Deployment Assembly',
    desc: 'Lightweight rated aluminum tripod with geared hoist positioned directly over the pit opening.',
    details: 'Flexible elastomer skirt contains noxious vapors and prevents probe tipping against pit masonry.',
    status: 'Mechanical Support & Vapor Seal'
  },
  probe: {
    title: 'Self-Fluidizing Intake Probe Head',
    type: 'Dual-Action Extraction Head',
    desc: 'Stainless steel head combining rotating jet ring, flexible auger, and coarse protective cage.',
    details: 'Diverts pressurized liquid from pump discharge to liquefy dense bottom sludge cake without an auxiliary jet pump.',
    status: 'Fluidizing Sludge Matrix'
  },
  pump: {
    title: 'Progressive Cavity Sludge Pump',
    type: 'Positive-Displacement Pump (Daughter Unit)',
    desc: 'Metallic helical rotor rotating inside a resilient elastomer double-helix stator.',
    details: 'Generates non-pulsating positive discharge pressure to push thick viscous sludge through 50–100 m lay-flat hose.',
    status: 'Positive-Displacement Transfer'
  },
  bypass: {
    title: 'Recirculation Jet Bypass Line',
    type: 'Closed Hydraulic Loop',
    desc: 'Calibrated diversion from pump discharge manifold feeding the fluidizing jet nozzles.',
    details: 'Eliminates the weight, cost, and electrical power draw of a separate jetting pump.',
    status: 'Supernatant Recirculation'
  },
  hose: {
    title: 'Lay-Flat Sludge Transfer Hose',
    type: 'Fluid Conveyance Line (50–100 m Target)',
    desc: 'High-tensile, abrasion-resistant lay-flat hose running through narrow alleys where vehicles cannot fit.',
    details: 'Quick-connect camlock couplings with integrated non-drip check valves. Target reach 50–100 m.',
    status: 'Enclosed Pressurized Transfer'
  },
  mother: {
    title: 'Mother Unit (Mobile Storage & Transport Base)',
    type: 'Roadway Support Vehicle',
    desc: 'Utility transport truck parked on the nearest accessible road with sealed storage tank and rear ramp.',
    details: 'Transports the daughter unit between sites and stores collected sludge for authorized FSTP treatment.',
    status: 'Road-Level Collector'
  },
  controller: {
    title: 'Intelligent Pump & Safety Controller',
    type: 'Closed-Loop Mechatronics',
    desc: 'Embedded microcontroller evaluating motor current trends, discharge pressure, and inline flow rate.',
    details: 'Automatically adjusts pump speed and jet flow; stops pump instantly on dry-run detection; initiates backflush on clogs.',
    status: 'Active Diagnostics'
  },
  gas: {
    title: 'Layered Gas Safety & Emergency Interlock',
    type: 'Worker Safety Suite',
    desc: 'Continuous monitoring of H₂S, CH₄ (LEL), CO, and O₂ with dual-level alarms.',
    details: 'Hardwired cutoff isolates motor power on danger threshold breach; requires external check prior to manhole opening.',
    status: 'Fail-Safe Interlock'
  }
};

function initSchematicInspector() {
  const nodes = document.querySelectorAll('.schematic-node');
  const titleEl = document.getElementById('inspector-title');
  const typeEl = document.getElementById('inspector-type');
  const descEl = document.getElementById('inspector-desc');
  const detailsEl = document.getElementById('inspector-details');
  const statusEl = document.getElementById('inspector-status');

  if (!nodes.length || !titleEl) return;

  function updateInspector(key) {
    const data = schematicData[key];
    if (!data) return;

    nodes.forEach(n => {
      n.classList.remove('selected');
      if (n.dataset.node === key) n.classList.add('selected');
    });

    titleEl.textContent = data.title;
    typeEl.textContent = data.type;
    descEl.textContent = data.desc;
    detailsEl.textContent = data.details;
    statusEl.textContent = data.status;
  }

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      updateInspector(node.dataset.node);
    });
  });

  updateInspector('pump');
}

/* --------------------------------------------------------------------------
   5. Operating Modes Switcher
   -------------------------------------------------------------------------- */
function initModeSwitcher() {
  const modeBtns = document.querySelectorAll('.mode-toggle-btn');
  const modePanes = document.querySelectorAll('.mode-content-pane');

  if (!modeBtns.length) return;

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetMode = btn.dataset.mode;
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      modePanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `mode-${targetMode}`);
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. Safety Alarm System Simulator
   -------------------------------------------------------------------------- */
function initAlarmSimulator() {
  const simBtns = document.querySelectorAll('.alarm-sim-btn');
  const simStatusBox = document.getElementById('alarm-sim-status');
  const simActionText = document.getElementById('alarm-sim-action');
  const simIndicator = document.getElementById('alarm-sim-indicator');

  if (!simBtns.length || !simStatusBox) return;

  const states = {
    normal: {
      title: 'NORMAL OPERATION (All Sensors Green)',
      action: 'Atmosphere safe (H₂S < 5 ppm, LEL < 5%). Continuous pumping and fluidization active.',
      color: '#059669',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    warning: {
      title: 'LEVEL 1: WARNING TRIGGERED (Caution Threshold)',
      action: 'Audible beeper pulses. Remote operator alerted. Agitator speed automatically modulated down. Operator prepares for immediate stop.',
      color: '#D97706',
      bg: 'rgba(217, 119, 6, 0.12)',
      border: 'rgba(217, 119, 6, 0.35)'
    },
    danger: {
      title: 'LEVEL 2: DANGER TRIPPED (Hardwired Shutdown)',
      action: 'Gas or tilt limit breached! Hardwired contactor cuts 24V motor power instantly. Strobe and high-decibel siren active. Immediate operator evacuation upwind.',
      color: '#DC2626',
      bg: 'rgba(220, 38, 38, 0.15)',
      border: 'rgba(220, 38, 38, 0.4)'
    }
  };

  simBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stateKey = btn.dataset.state;
      const cfg = states[stateKey];
      if (!cfg) return;

      simBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      simStatusBox.style.backgroundColor = cfg.bg;
      simStatusBox.style.borderColor = cfg.border;
      simStatusBox.querySelector('h5').textContent = cfg.title;
      simStatusBox.querySelector('h5').style.color = cfg.color;
      simActionText.textContent = cfg.action;
      simIndicator.style.backgroundColor = cfg.color;
    });
  });
}

/* --------------------------------------------------------------------------
   7. Operating Workflow Stepper
   -------------------------------------------------------------------------- */
const workflowData = [
  {
    step: 'Step 01',
    title: 'Mother Vehicle Roadway Staging',
    desc: 'Park mother utility truck on nearest accessible road, set hazard cones, deploy ramp.',
    checklist: ['Secure vehicle parking brake', 'Deploy safety cones', 'Inspect lay-flat hose couplings'],
    safety: 'Verify traffic clearance; ensure vehicle exhaust is directed away from working alley.'
  },
  {
    step: 'Step 02',
    title: 'Daughter Unit Remote Transit',
    desc: 'Unload compact 4WD daughter unit and navigate through narrow lane via pan-tilt camera.',
    checklist: ['Test remote telemetry link', 'Check 24V battery SoC (> 80%)', 'Navigate 1.2 m alleys safely'],
    safety: 'Maintain 5+ meter operator standoff distance on gradients.'
  },
  {
    step: 'Step 03',
    title: 'External Atmospheric Gas Check',
    desc: 'Sample pit atmosphere from outside the pit using certified multi-gas probe before touching manhole.',
    checklist: ['Zero calibrate detector in clean air', 'Verify H₂S, CH₄, CO, O₂ levels', 'Confirm gas concentrations below Level 1 threshold'],
    safety: 'Never position head or torso over pit mouth prior to verification.'
  },
  {
    step: 'Step 04',
    title: 'Position Tripod Station & Skirt',
    desc: 'Erect rated aluminum tripod over pit access and seat flexible elastomer vapor containment skirt flush.',
    checklist: ['Level tripod legs on solid ground', 'Center hoist over manhole', 'Seal skirt edges against odors'],
    safety: 'Confirm tripod working load limit rating (150 kg WLL).'
  },
  {
    step: 'Step 05',
    title: 'Lower Integrated Probe Assembly',
    desc: 'Use geared hoist to lower probe through skirt into the pit supernatant liquid layer.',
    checklist: ['Inspect protective mesh cage', 'Verify camlock seals', 'Secure safety strain relief cable'],
    safety: 'Keep hands clear of hoist pinch points; wear chemical nitrile gloves.'
  },
  {
    step: 'Step 06',
    title: 'Activate Fluidizing Jet & Pump',
    desc: 'Start progressive cavity pump at priming speed; divert liquid through rotating jet nozzles to soften sludge cake.',
    checklist: ['Monitor recirculation pressure', 'Allow 2–3 minutes fluidization in heavy sludge', 'Engage auger to guide solids'],
    safety: 'Continuously evaluate pit-top gas telemetry during initial agitation.'
  },
  {
    step: 'Step 07',
    title: 'Intelligent Parameter Monitoring',
    desc: 'Microcontroller monitors motor current, discharge pressure, and inline flow for automated speed/bypass adjustments.',
    checklist: ['Current rise -> increase jet bypass, slow pump', 'Loss of flow -> instant dry-run stop', 'High pressure -> trigger backflush'],
    safety: 'Two-level gas alarm remains active with hardwired power cutoff.'
  },
  {
    step: 'Step 08',
    title: 'Closed Sludge Transfer to Truck',
    desc: 'Progressive cavity pump transfers fluidized sludge along 50–100 m lay-flat hose into the mother unit storage tank.',
    checklist: ['Inspect hose line along alley for kinks', 'Check mother truck level gauge', 'Maintain operator radio contact'],
    safety: 'Completely closed fluid path. Zero open buckets or exposed slurry.'
  },
  {
    step: 'Step 09',
    title: 'Backflush, Washdown & Pit Closure',
    desc: 'Execute clean-water backflush cycle, hoist probe, disinfect equipment, secure pit cover, and log job.',
    checklist: ['Run clean water rinse through pump', 'Stow lay-flat hose on reel', 'Secure manhole lid tightly', 'Log extracted volume'],
    safety: 'Wash hands and protective PPE thoroughly. Inspect battery voltage.'
  }
];

function initWorkflowStepper() {
  const track = document.querySelector('.workflow-track');
  const detailTitle = document.getElementById('step-detail-title');
  const detailDesc = document.getElementById('step-detail-desc');
  const detailChecklist = document.getElementById('step-detail-checklist');
  const detailSafety = document.getElementById('step-detail-safety');

  if (!track || !detailTitle) return;

  function showStep(index) {
    const data = workflowData[index];
    if (!data) return;

    track.querySelectorAll('.workflow-card').forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });

    detailTitle.textContent = `${data.step}: ${data.title}`;
    detailDesc.textContent = data.desc;

    detailChecklist.innerHTML = data.checklist
      .map(item => `<li><span class="unit-feature-bullet">✓</span>${item}</li>`)
      .join('');

    detailSafety.textContent = data.safety;
  }

  track.querySelectorAll('.workflow-card').forEach((card, index) => {
    card.addEventListener('click', () => {
      showStep(index);
    });
  });

  showStep(0);
}

/* --------------------------------------------------------------------------
   8. Business Viability Interactive Calculator
   -------------------------------------------------------------------------- */
function initBusinessCalculator() {
  const jobsSlider = document.getElementById('calc-jobs-slider');
  const jobsDisplay = document.getElementById('calc-jobs-val');
  const revInput = document.getElementById('calc-rev-input');
  const costInput = document.getElementById('calc-cost-input');
  const capexInput = document.getElementById('calc-capex-input');

  const outRevenue = document.getElementById('calc-out-revenue');
  const outCosts = document.getElementById('calc-out-costs');
  const outSurplus = document.getElementById('calc-out-surplus');
  const outPayback = document.getElementById('calc-out-payback');
  const outStatus = document.getElementById('calc-out-status');

  const presetBaselineBtn = document.getElementById('calc-preset-baseline');
  const presetLowBtn = document.getElementById('calc-preset-low');
  const presetHighBtn = document.getElementById('calc-preset-high');

  if (!jobsSlider || !outRevenue) return;

  function formatINR(val) {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  function calculate() {
    const jobs = parseInt(jobsSlider.value, 10);
    const revPerJob = parseFloat(revInput.value) || 0;
    const monthlyCost = parseFloat(costInput.value) || 0;
    const capex = parseFloat(capexInput.value) || 0;

    jobsDisplay.textContent = `${jobs} jobs / month`;

    const totalRev = jobs * revPerJob;
    const netSurplus = totalRev - monthlyCost;

    outRevenue.textContent = formatINR(totalRev);
    outCosts.textContent = formatINR(monthlyCost);
    outSurplus.textContent = formatINR(netSurplus);

    if (netSurplus > 0) {
      const paybackMonths = (capex / netSurplus).toFixed(1);
      outPayback.textContent = `~${paybackMonths} Months`;
      outStatus.className = 'calc-status-callout calc-status-surplus';
      outStatus.innerHTML = `<strong>Operational Surplus:</strong> Generates ${formatINR(netSurplus)}/month towards capital recovery and operator surplus.`;
    } else {
      outPayback.textContent = 'Indefinite (Operating Deficit)';
      outStatus.className = 'calc-status-callout calc-status-deficit';
      outStatus.innerHTML = `<strong>Operational Shortfall:</strong> Monthly deficit of ${formatINR(Math.abs(netSurplus))}. Volume insufficient to cover fixed monthly overheads without subsidy.`;
    }
  }

  jobsSlider.addEventListener('input', calculate);
  revInput.addEventListener('input', calculate);
  costInput.addEventListener('input', calculate);
  capexInput.addEventListener('input', calculate);

  if (presetBaselineBtn) {
    presetBaselineBtn.addEventListener('click', () => {
      jobsSlider.value = 30;
      revInput.value = 1500;
      costInput.value = 24000;
      capexInput.value = 250000;
      calculate();
    });
  }

  if (presetLowBtn) {
    presetLowBtn.addEventListener('click', () => {
      jobsSlider.value = 15;
      revInput.value = 1500;
      costInput.value = 24000;
      capexInput.value = 250000;
      calculate();
    });
  }

  if (presetHighBtn) {
    presetHighBtn.addEventListener('click', () => {
      jobsSlider.value = 45;
      revInput.value = 1500;
      costInput.value = 24000;
      capexInput.value = 250000;
      calculate();
    });
  }

  calculate();
}

/* --------------------------------------------------------------------------
   9. Hero Hotspot & Modal Handler
   -------------------------------------------------------------------------- */
const hotspotDetails = {
  1: {
    title: 'Compact Robotic Daughter Unit',
    subtitle: 'Narrow Lane & Steep Terrain Access Platform',
    desc: 'A rugged four-wheel electric chassis carrying the progressive cavity pumping core, 24V swappable battery pack, temporary 200–250 L holding buffer, and pan-tilt camera navigation suite. Built specifically to navigate 1.2 m narrow alleys where trucks cannot fit.'
  },
  2: {
    title: 'Freestanding Tripod & Hoist Station',
    subtitle: 'Pit Centering & Vapor Containment',
    desc: 'An adjustable, rated aluminum tripod positioning directly over residential pit openings. Holds the rated hoist and integrated flexible skirt to minimize odor, splashing, and toxic vapor dispersion.'
  },
  3: {
    title: 'Positive-Pressure Lay-Flat Sludge Hose',
    subtitle: '50–100 m Target Transfer Reach',
    desc: 'High-tensile, abrasion-resistant lay-flat hose deployed down the alley to the mother vehicle. Fluidized sludge is pumped under positive progressive-cavity discharge pressure uphill or around corners.'
  },
  4: {
    title: 'Mother Unit (Mobile Storage & Transport Base)',
    subtitle: 'Roadway Logistics & Bulk Collector',
    desc: 'Commercial utility transport truck parked on the nearest accessible road. Features a rear tilt ramp to carry the daughter unit, a high-volume sealed tank, and decontamination wash supply.'
  }
};

function initHotspotModal() {
  const modalOverlay = document.getElementById('generic-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const hotspotBtns = document.querySelectorAll('.image-hotspot-point');
  const discussBtns = document.querySelectorAll('[data-open-modal="contact"]');

  if (!modalOverlay || !modalTitle) return;

  function openModal(title, subtitle, contentHtml) {
    modalTitle.textContent = title;
    modalSubtitle.textContent = subtitle || '';
    modalBody.innerHTML = contentHtml;
    modalOverlay.classList.add('open');
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  hotspotBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.hotspot;
      const data = hotspotDetails[id];
      if (data) {
        openModal(data.title, data.subtitle, `<p class="card-desc">${data.desc}</p>`);
      }
    });
  });

  discussBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(
        'Research Collaboration & Technical Inquiries',
        'Academic Innovation Project • Design Phase Feedback',
        `
          <p class="card-desc" style="margin-bottom: 1.5rem;">
            We welcome constructive peer review from sanitation engineers, municipal authorities (ULBs / Gram Panchayats), academic researchers, and equipment manufacturers.
          </p>
          <div class="tech-notice" style="margin-bottom: 1.5rem;">
            <svg class="tech-notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <strong>Academic Project Notice:</strong>
              This innovation is currently in the engineering concept and prototype design stage. We are actively seeking technical mentoring, simulated-sludge test pit access, and supplier partnerships.
            </div>
          </div>
          <form id="collab-inquiry-form" onsubmit="event.preventDefault(); alert('Thank you for your interest! In this demonstration mode, your feedback is recorded for jury review.'); document.getElementById('generic-modal').classList.remove('open');">
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <div>
                <label style="display:block; font-size:0.8125rem; font-weight:600; margin-bottom:0.35rem;">Your Name / Designation</label>
                <input type="text" required placeholder="e.g. Municipal Sanitation Engineer / Jury Member" style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px; font-family:inherit;" />
              </div>
              <div>
                <label style="display:block; font-size:0.8125rem; font-weight:600; margin-bottom:0.35rem;">Organization / University</label>
                <input type="text" required placeholder="e.g. Engineering Institute / Municipal Corporation" style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px; font-family:inherit;" />
              </div>
              <div>
                <label style="display:block; font-size:0.8125rem; font-weight:600; margin-bottom:0.35rem;">Area of Discussion</label>
                <select style="width:100%; padding:0.65rem 0.85rem; border:1px solid #CBD5E1; border-radius:6px; font-family:inherit;">
                  <option>Progressive Cavity Pump Engineering</option>
                  <option>Self-Fluidizing Intake Validation</option>
                  <option>Intelligent Control Feedback</option>
                  <option>Gram Panchayat Pilot Collaboration</option>
                  <option>Component Supplier Quotations</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="margin-top:0.5rem;">Submit Research Inquiry</button>
            </div>
          </form>
        `
      );
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
  });
}

/* --------------------------------------------------------------------------
   10. Specifications Filter
   -------------------------------------------------------------------------- */
function initSpecsFilter() {
  const filterBtns = document.querySelectorAll('.specs-filter-btn');
  const specRows = document.querySelectorAll('.specs-table tbody tr');

  if (!filterBtns.length || !specRows.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      specRows.forEach(row => {
        row.style.display = (category === 'all' || row.dataset.category === category) ? '' : 'none';
      });
    });
  });
}
