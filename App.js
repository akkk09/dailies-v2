const DOM = {
    appContainer: document.querySelector('.app-container'),
    header: document.querySelector('.header'),
    statsBtn: document.getElementById('stats-btn'),
    pomoDisplay: document.getElementById('pomo-display'),
    tabFocus: document.getElementById('tab-focus'),
    tabBreak: document.getElementById('tab-break'),
    pomoPlay: document.getElementById('pomo-play'),
    pomoPause: document.getElementById('pomo-pause'),
    pomoReset: document.getElementById('pomo-reset'),
    bunnyPopup: document.getElementById('bunny-popup'),
    bunnyContainer: document.getElementById('bunny-container'),
    bunnyCanvas: document.getElementById('bunny-canvas'),
    continueBtn: document.getElementById('continue-btn'),
    heatmapGrid: document.getElementById('heatmap-grid'),
    progressSection: document.querySelector('.progress-section'),
    habitsHeader: document.querySelector('.habits-header'),
    streakCount: document.getElementById('streak-count'),
    mascotMessage: document.getElementById('mascot-message'),
    progressText: document.getElementById('progress-text'),
    progressBar: document.getElementById('progress-bar'),
    habitList: document.getElementById('habit-list'),
    addHabitBtn: document.getElementById('add-habit-btn'),
    addModal: document.getElementById('add-modal'),
    modalContent: document.querySelector('.modal-content'),
    cancelBtn: document.getElementById('cancel-btn'),
    saveBtn: document.getElementById('save-btn'),
    newHabitInput: document.getElementById('new-habit-input'),
    historyModal: document.getElementById('history-modal'),
    historyDateTitle: document.getElementById('history-date-title'),
    historyDetails: document.getElementById('history-details'),
    historyCloseBtn: document.getElementById('history-close-btn'),
    distractionModal: document.getElementById('distraction-modal'),
    distractBtns: document.querySelectorAll('.distract-btn'),
    statsModal: document.getElementById('stats-modal'),
    statsContainer: document.getElementById('stats-container'),
    statsCloseBtn: document.getElementById('stats-close-btn'),
    navBtns: document.querySelectorAll('.nav-btn'),
    tabViews: document.querySelectorAll('.tab-view'),
    
    // Shop & Currency
    carrotCount: document.getElementById('carrot-count'),
    freezeDisplay: document.getElementById('freeze-display'),
    freezeCount: document.getElementById('freeze-count'),
    shopBtn: document.getElementById('shop-btn'),
    shopModal: document.getElementById('shop-modal'),
    shopCloseBtn: document.getElementById('shop-close-btn'),
    buyFreezeBtn: document.getElementById('buy-freeze-btn')
};

let state = {
    habits: JSON.parse(localStorage.getItem('bunny_habits')) || [
        { id: '1', name: 'Drink water', completed: false },
        { id: '2', name: 'Stretch for 5 mins', completed: false }
    ],
    streak: parseInt(localStorage.getItem('bunny_streak')) || 0,
    lastCompletedDate: localStorage.getItem('bunny_last_date') || null,
    currentDate: localStorage.getItem('bunny_current_date') || new Date().toISOString().split('T')[0],
    today: new Date().toISOString().split('T')[0],
    history: JSON.parse(localStorage.getItem('bunny_history')) || {},
    distractions: JSON.parse(localStorage.getItem('bunny_distractions')) || { texting: 0, watching: 0, studying: 0, other: 0 },
    carrots: parseInt(localStorage.getItem('bunny_carrots')) || 0,
    streakFreezes: parseInt(localStorage.getItem('bunny_streak_freezes')) || 0,
    totalFocusTime: parseInt(localStorage.getItem('bunny_total_focus')) || 0 // in seconds
};

let pomo = {
    timeLeft: 25 * 60,
    timerId: null,
    isRunning: false,
    mode: 'focus', // 'focus' | 'break'
    hiddenTime: 0
};

const messages = {
    start: ["Hi cutie! Ready to crush your goals today? 💕", "Let's have a wonderful day! 🌸", "I believe in you! 💖"],
    middle: ["You're doing amazing! Keep going! ✨", "So proud of you! 🥰", "Almost there cutie! 🥕"],
    done: ["YAY! Perfect day! You're the best! 🎉", "All done! I love you! 💕", "Wow! You're unstoppable! 🌟"]
};

// -----------------------------------------------------
// 3D Bunny Setup with Three.js
// -----------------------------------------------------
let scene, camera, renderer;
let bunnyGroup, leftEar, rightEar, leftArm, rightArm;
let clock = new THREE.Clock();
let isCelebrating = false;

function initThreeJS() {
    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(45, 200 / 200, 0.1, 100);
    camera.position.set(0, 1.8, 6.5);
    camera.lookAt(0, 0.6, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(200, 200);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Removed outputEncoding as it's deprecated in newer r128 builds in favor of outputColorSpace, keeping default for now
    DOM.bunnyCanvas.appendChild(renderer.domElement);

    // Softer, cuter lighting (Hemisphere is great for soft aesthetics)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffb6c1, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xffb6c1, 0.5);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.2;
    plane.receiveShadow = true;
    scene.add(plane);

    bunnyGroup = new THREE.Group();
    scene.add(bunnyGroup);
    
    const bunnyColor = 0xffffff; // Pure white looks cleaner with hemisphere lighting
    const bodyMat = new THREE.MeshStandardMaterial({ color: bunnyColor, roughness: 0.9, metalness: 0.05 });
    const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffa6c9, roughness: 0.7 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
    const bowMat = new THREE.MeshStandardMaterial({ color: 0xff66a3, roughness: 0.5 }); // Hot pink bow

    // Body
    const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
    bodyGeo.scale(1.05, 0.9, 0.95);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -0.3;
    body.castShadow = true;
    body.receiveShadow = true;
    bunnyGroup.add(body);
    
    // Tail
    const tailGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(0, -0.5, -0.95);
    tail.castShadow = true;
    bunnyGroup.add(tail);

    // Head (Rounder & slightly bigger)
    const headGeo = new THREE.SphereGeometry(1.05, 32, 32);
    headGeo.scale(1.05, 0.85, 1);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.y = 0.9;
    head.castShadow = true;
    head.receiveShadow = true;
    bunnyGroup.add(head);

    // Ears
    const earGeo = new THREE.CylinderGeometry(0.18, 0.25, 1.4, 16);
    const earTopGeo = new THREE.SphereGeometry(0.18, 16, 16);
    earGeo.translate(0, 0.7, 0);
    
    leftEar = new THREE.Group();
    const lEarMesh = new THREE.Mesh(earGeo, bodyMat);
    lEarMesh.castShadow = true;
    const lEarTop = new THREE.Mesh(earTopGeo, bodyMat);
    lEarTop.position.set(0, 1.4, 0);
    lEarTop.castShadow = true;
    lEarMesh.add(lEarTop);
    leftEar.add(lEarMesh);
    leftEar.position.set(-0.45, 1.6, -0.1);
    leftEar.rotation.z = 0.15;
    bunnyGroup.add(leftEar);
    
    const innerEarGeo = new THREE.CylinderGeometry(0.1, 0.15, 1.1, 16);
    innerEarGeo.translate(0, 0, 0);
    const leftInner = new THREE.Mesh(innerEarGeo, pinkMat);
    leftInner.position.set(0, 0.75, 0.15);
    leftEar.add(leftInner);

    rightEar = new THREE.Group();
    const rEarMesh = new THREE.Mesh(earGeo, bodyMat);
    rEarMesh.castShadow = true;
    const rEarTop = new THREE.Mesh(earTopGeo, bodyMat);
    rEarTop.position.set(0, 1.4, 0);
    rEarTop.castShadow = true;
    rEarMesh.add(rEarTop);
    rightEar.add(rEarMesh);
    rightEar.position.set(0.45, 1.6, -0.1);
    rightEar.rotation.z = -0.15;
    bunnyGroup.add(rightEar);
    
    const rightInner = new THREE.Mesh(innerEarGeo, pinkMat);
    rightInner.position.set(0, 0.75, 0.15);
    rightEar.add(rightInner);

    // Eyes (Anime style with double highlights)
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeL = new THREE.Mesh(eyeGeo, blackMat);
    eyeL.position.set(-0.4, 1.0, 0.95);
    bunnyGroup.add(eyeL);
    
    const eyeR = new THREE.Mesh(eyeGeo, blackMat);
    eyeR.position.set(0.4, 1.0, 0.95);
    bunnyGroup.add(eyeR);
    
    const hl1Geo = new THREE.SphereGeometry(0.04, 8, 8);
    const hl2Geo = new THREE.SphereGeometry(0.02, 8, 8);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const hl1L = new THREE.Mesh(hl1Geo, hlMat);
    hl1L.position.set(-0.04, 0.04, 0.09);
    eyeL.add(hl1L);
    const hl2L = new THREE.Mesh(hl2Geo, hlMat);
    hl2L.position.set(0.04, -0.03, 0.1);
    eyeL.add(hl2L);

    const hl1R = new THREE.Mesh(hl1Geo, hlMat);
    hl1R.position.set(-0.04, 0.04, 0.09);
    eyeR.add(hl1R);
    const hl2R = new THREE.Mesh(hl2Geo, hlMat);
    hl2R.position.set(0.04, -0.03, 0.1);
    eyeR.add(hl2R);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.07, 16, 16);
    noseGeo.scale(1.5, 0.8, 1);
    const nose = new THREE.Mesh(noseGeo, pinkMat);
    nose.position.set(0, 0.85, 1.05);
    bunnyGroup.add(nose);
    
    // Tongue (Cute open mouth detail)
    const tongueGeo = new THREE.SphereGeometry(0.05, 16, 16);
    tongueGeo.scale(1.2, 0.8, 1);
    const tongue = new THREE.Mesh(tongueGeo, pinkMat);
    tongue.position.set(0, 0.75, 1.02);
    bunnyGroup.add(tongue);
    
    // Blush
    const blushGeo = new THREE.SphereGeometry(0.15, 16, 16);
    blushGeo.scale(1, 0.6, 0.3);
    const blushL = new THREE.Mesh(blushGeo, pinkMat);
    blushL.position.set(-0.6, 0.82, 0.85);
    blushL.rotation.z = 0.1;
    bunnyGroup.add(blushL);
    
    const blushR = new THREE.Mesh(blushGeo, pinkMat);
    blushR.position.set(0.6, 0.82, 0.85);
    blushR.rotation.z = -0.1;
    bunnyGroup.add(blushR);

    // Bow Tie!
    const bow = new THREE.Group();
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), bowMat);
    bow.add(knot);
    const bowLoop = new THREE.SphereGeometry(0.18, 16, 16);
    bowLoop.scale(1, 0.6, 0.5);
    const leftLoop = new THREE.Mesh(bowLoop, bowMat);
    leftLoop.position.set(-0.16, 0, 0);
    bow.add(leftLoop);
    const rightLoop = new THREE.Mesh(bowLoop, bowMat);
    rightLoop.position.set(0.16, 0, 0);
    bow.add(rightLoop);
    bow.position.set(0, 0.45, 0.98);
    bow.rotation.x = -0.2;
    bunnyGroup.add(bow);
    
    // Arms
    const armGeo = new THREE.SphereGeometry(0.22, 16, 16);
    armGeo.scale(0.8, 1.5, 0.8);
    leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.75, 0.0, 0.6);
    leftArm.rotation.z = -0.4;
    leftArm.rotation.x = -0.2;
    leftArm.castShadow = true;
    bunnyGroup.add(leftArm);
    
    rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.75, 0.0, 0.6);
    rightArm.rotation.z = 0.4;
    rightArm.rotation.x = -0.2;
    rightArm.castShadow = true;
    bunnyGroup.add(rightArm);
    
    // Paws (Feet)
    const footGeo = new THREE.SphereGeometry(0.28, 16, 16);
    footGeo.scale(1, 0.6, 1.3);
    const leftFoot = new THREE.Mesh(footGeo, bodyMat);
    leftFoot.position.set(-0.45, -1.15, 0.45);
    leftFoot.rotation.y = -0.2;
    leftFoot.castShadow = true;
    bunnyGroup.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(footGeo, bodyMat);
    rightFoot.position.set(0.45, -1.15, 0.45);
    rightFoot.rotation.y = 0.2;
    rightFoot.castShadow = true;
    bunnyGroup.add(rightFoot);
    
    // Toe Beans (Paw Pads)
    const padMat = new THREE.MeshStandardMaterial({ color: 0xffa6c9, roughness: 0.8 });
    const mainPadGeo = new THREE.SphereGeometry(0.12, 16, 16);
    mainPadGeo.scale(1, 0.5, 1);
    const toeGeo = new THREE.SphereGeometry(0.06, 16, 16);
    toeGeo.scale(1, 0.5, 1);
    
    function createPawPads(foot) {
        const mainPad = new THREE.Mesh(mainPadGeo, padMat);
        mainPad.position.set(0, -0.15, 0.1);
        mainPad.rotation.x = 0.2;
        foot.add(mainPad);
        
        const positions = [[-0.12, -0.1, 0.25], [0, -0.05, 0.28], [0.12, -0.1, 0.25]];
        positions.forEach(pos => {
            const toe = new THREE.Mesh(toeGeo, padMat);
            toe.position.set(...pos);
            toe.rotation.x = 0.2;
            foot.add(toe);
        });
    }
    
    createPawPads(leftFoot);
    createPawPads(rightFoot);
    
    renderer.setAnimationLoop(() => {
        const t = clock.getElapsedTime();
        if (!isCelebrating) {
            // More bouncy and lively idle animation
            bunnyGroup.position.y = Math.sin(t * 4) * 0.05;
            leftEar.rotation.z = 0.15 + Math.sin(t * 3) * 0.08;
            rightEar.rotation.z = -0.15 + Math.cos(t * 2.8) * 0.08;
            leftArm.rotation.z = -0.4 + Math.sin(t * 4) * 0.1;
            rightArm.rotation.z = 0.4 + Math.cos(t * 4) * 0.1;
            leftFoot.rotation.x = Math.sin(t * 4) * 0.05;
            rightFoot.rotation.x = Math.cos(t * 4) * 0.05;
        }
        renderer.render(scene, camera);
    });
}

function animateThreeCelebration() {
    isCelebrating = true;
    const tl = gsap.timeline({ onComplete: () => { isCelebrating = false; } });
    tl.to(bunnyGroup.position, { y: 0.8, duration: 0.3, yoyo: true, repeat: 3, ease: "power1.inOut" }, 0);
    tl.to(bunnyGroup.rotation, { y: Math.PI * 2, duration: 1.2, ease: "back.out(1.5)" }, 0);
    tl.to([leftEar.rotation, rightEar.rotation], { x: 0.3, duration: 0.2, yoyo: true, repeat: 5 }, 0);
}

function animateThreeClick() {
    if (isCelebrating) return;
    isCelebrating = true;
    const tl = gsap.timeline({ onComplete: () => { isCelebrating = false; bunnyGroup.rotation.y = 0; } });
    tl.to(bunnyGroup.position, { y: 0.4, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.out" });
    tl.to(bunnyGroup.rotation, { y: 0.3, duration: 0.1, yoyo: true, repeat: 1 }, 0);
    tl.to([leftEar.rotation, rightEar.rotation], { z: (i) => i === 0 ? 0.4 : -0.4, duration: 0.1, yoyo: true, repeat: 1 }, 0);
}

// -----------------------------------------------------
// App Logic
// -----------------------------------------------------

gsap.set([DOM.addModal, DOM.historyModal, DOM.distractionModal, DOM.statsModal], { display: 'none', autoAlpha: 0 });
gsap.set(DOM.modalContent, { scale: 0.5 });
gsap.set(DOM.progressBar, { width: "0%" });
gsap.set(DOM.bunnyPopup, { autoAlpha: 0 });
gsap.set(DOM.bunnyContainer, { y: '100%' });

function showBunnyPopup() {
    gsap.to(DOM.bunnyPopup, { autoAlpha: 1, duration: 0.3, ease: "power1.out" });
    gsap.to(DOM.bunnyContainer, { y: '0%', duration: 0.5, ease: "back.out(1.2)" });
}

function hideBunnyPopup() {
    gsap.to(DOM.bunnyContainer, { y: '100%', duration: 0.3, ease: "power2.in" });
    gsap.to(DOM.bunnyPopup, { autoAlpha: 0, duration: 0.3, delay: 0.1 });
}

function init() {
    initThreeJS();
    checkNewDay();
    saveTodayToHistory();
    renderStreak();
    renderHeatmap();
    renderHabits(true);
    updateProgress(true);
    setupEventListeners();
    updatePomoDisplay();
    
    const tl = gsap.timeline();
    tl.from(DOM.header, { y: -50, opacity: 0, duration: 0.6, ease: "back.out(1.7)", clearProps: "all" })
      .from('#habits-view', { y: 20, opacity: 0, duration: 0.5, ease: "power2.out", clearProps: "all" }, "-=0.3")
      .from('.bottom-nav', { y: 50, opacity: 0, duration: 0.5, ease: "back.out(1.2)", clearProps: "all" }, "-=0.4");
}

function saveTodayToHistory() {
    state.history[state.today] = {
        habits: state.habits.map(h => ({ name: h.name, completed: h.completed, note: h.note || "" }))
    };
    saveState();
}

function checkNewDay() {
    if (state.currentDate !== state.today) {
        state.habits.forEach(h => {
            h.completed = false;
            h.note = ""; 
        });
        
        if (state.lastCompletedDate) {
            const lastDate = new Date(state.lastCompletedDate);
            const todayDate = new Date(state.today);
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays > 1) {
                // Determine if we can use a freeze
                if (state.streakFreezes > 0) {
                    state.streakFreezes--;
                    // Fill in the missing yesterday as "frozen" in history so heatmap looks cool
                    const yesterday = new Date(todayDate);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yStr = yesterday.toISOString().split('T')[0];
                    if (!state.history[yStr]) {
                        state.history[yStr] = { habits: [], frozen: true };
                    } else {
                        state.history[yStr].frozen = true;
                    }
                    // Act as if we completed it yesterday to keep streak alive
                    state.lastCompletedDate = yStr;
                } else {
                    state.streak = 0;
                }
            }
        }
        
        state.currentDate = state.today;
        saveState();
    }
}

function saveState() {
    localStorage.setItem('bunny_habits', JSON.stringify(state.habits));
    localStorage.setItem('bunny_streak', state.streak.toString());
    localStorage.setItem('bunny_last_date', state.lastCompletedDate || '');
    localStorage.setItem('bunny_current_date', state.currentDate);
    localStorage.setItem('bunny_history', JSON.stringify(state.history));
    localStorage.setItem('bunny_distractions', JSON.stringify(state.distractions));
    localStorage.setItem('bunny_carrots', state.carrots.toString());
    localStorage.setItem('bunny_streak_freezes', state.streakFreezes.toString());
    localStorage.setItem('bunny_total_focus', state.totalFocusTime.toString());
}

// POMODORO LOGIC
function updatePomoDisplay() {
    const mins = Math.floor(pomo.timeLeft / 60).toString().padStart(2, '0');
    const secs = (pomo.timeLeft % 60).toString().padStart(2, '0');
    DOM.pomoDisplay.textContent = `${mins}:${secs}`;
}

function startPomo() {
    if (pomo.isRunning) return;
    pomo.isRunning = true;
    DOM.pomoPlay.style.display = 'none';
    DOM.pomoPause.style.display = 'block';
    
    pomo.timerId = setInterval(() => {
        pomo.timeLeft--;
        if (pomo.timeLeft <= 0) {
            clearInterval(pomo.timerId);
            pomo.isRunning = false;
            DOM.pomoPlay.style.display = 'block';
            DOM.pomoPause.style.display = 'none';
            // Alert user that time's up
            setMascotMessage(pomo.mode === 'focus' ? "Focus time is over! Great job! 🎉" : "Break is over! Ready to focus? 🐰");
            showBunnyPopup();
        }
        updatePomoDisplay();
    }, 1000);
}

function pausePomo() {
    pomo.isRunning = false;
    clearInterval(pomo.timerId);
    DOM.pomoPlay.style.display = 'block';
    DOM.pomoPause.style.display = 'none';
}

function resetPomo() {
    pausePomo();
    pomo.timeLeft = pomo.mode === 'focus' ? 25 * 60 : 5 * 60;
    updatePomoDisplay();
}

function switchPomoMode(mode) {
    pomo.mode = mode;
    if (mode === 'focus') {
        DOM.tabFocus.classList.add('active');
        DOM.tabBreak.classList.remove('active');
    } else {
        DOM.tabBreak.classList.add('active');
        DOM.tabFocus.classList.remove('active');
    }
    resetPomo();
}

function renderHeatmap() {
    DOM.heatmapGrid.innerHTML = '';
    const pastDays = 14;
    const todayObj = new Date(state.today);
    
    for (let i = pastDays - 1; i >= 0; i--) {
        const d = new Date(todayObj);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        if (i === 0) cell.classList.add('today');
        
        const historyData = state.history[dateStr];
        let level = 0;
        
        if (historyData) {
            if (historyData.frozen) {
                cell.classList.add('frozen');
            } else if (historyData.habits && historyData.habits.length > 0) {
                const completedCount = historyData.habits.filter(h => h.completed).length;
                const total = historyData.habits.length;
                const pct = completedCount / total;
                
                if (pct === 1) level = 3;
                else if (pct >= 0.5) level = 2;
                else if (pct > 0) level = 1;
            }
        }
        
        if (level > 0) cell.classList.add(`level-${level}`);
        
        cell.addEventListener('click', () => openHistoryModal(dateStr, historyData));
        DOM.heatmapGrid.appendChild(cell);
    }
}

function openHistoryModal(dateStr, historyData) {
    DOM.historyDateTitle.textContent = dateStr === state.today ? "Today" : dateStr;
    DOM.historyDetails.innerHTML = '';
    
    if (!historyData || (!historyData.frozen && (!historyData.habits || historyData.habits.length === 0))) {
        DOM.historyDetails.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No habits recorded.</p>';
    } else if (historyData.frozen) {
        DOM.historyDetails.innerHTML = '<div style="text-align:center; padding: 20px; background: #e0f7fa; border-radius: 12px; border: 2px solid #80deea; color: #00838f;"><h3>🧊 Streak Frozen</h3><p>You missed this day, but your streak was protected by a Streak Freeze!</p></div>';
    } else {
        historyData.habits.forEach((habit, idx) => {
            const row = document.createElement('div');
            row.style.background = '#fff0f5';
            row.style.padding = '10px';
            row.style.borderRadius = '12px';
            row.style.border = '1px solid #ffd1dc';
            
            const title = document.createElement('div');
            title.innerHTML = `${habit.completed ? '✅' : '❌'} <strong>${habit.name}</strong>`;
            row.appendChild(title);
            
            if (!habit.completed) {
                const noteInput = document.createElement('input');
                noteInput.type = 'text';
                noteInput.className = 'note-input';
                noteInput.placeholder = "Why didn't you do this? 🥺";
                noteInput.value = habit.note || '';
                
                noteInput.addEventListener('change', (e) => {
                    historyData.habits[idx].note = e.target.value;
                    if (dateStr === state.today) {
                        const currentHabit = state.habits.find(h => h.name === habit.name);
                        if (currentHabit) currentHabit.note = e.target.value;
                    }
                    saveState();
                });
                
                row.appendChild(noteInput);
            }
            
            DOM.historyDetails.appendChild(row);
        });
    }
    
    gsap.to(DOM.historyModal, { display: 'flex', autoAlpha: 1, duration: 0.2 });
    gsap.to(DOM.historyModal.querySelector('.modal-content'), { scale: 1, duration: 0.4, ease: "back.out(1.5)" });
}

function renderStatsModal() {
    DOM.statsContainer.innerHTML = '';
    const totalDistractions = Object.values(state.distractions).reduce((a, b) => a + b, 0);
    
    const colors = { texting: '#ff6b6b', watching: '#4facfe', studying: '#43e97b', other: '#a18cd1' };
    const labels = { texting: 'Texting📱', watching: 'Watching📺', studying: 'Studying📖', other: 'Other 🤷‍♀️' };
    
    if (totalDistractions === 0) {
        DOM.statsContainer.innerHTML = '<p style="text-align:center;">No distractions yet! You are a focus master! 🌸</p>';
    } else {
        Object.keys(state.distractions).forEach(key => {
            const val = state.distractions[key];
            const pct = (val / totalDistractions) * 100;
            
            const barHTML = `
                <div class="stat-bar-container">
                    <div class="stat-label">${labels[key]}</div>
                    <div class="stat-bar-outer">
                        <div class="stat-bar-inner" style="width: ${pct}%; background: ${colors[key]}"></div>
                    </div>
                    <div class="stat-count">${val}</div>
                </div>
            `;
            DOM.statsContainer.insertAdjacentHTML('beforeend', barHTML);
        });
    }
    
    gsap.to(DOM.statsModal, { display: 'flex', autoAlpha: 1, duration: 0.2 });
    gsap.to(DOM.statsModal.querySelector('.modal-content'), { scale: 1, duration: 0.4, ease: "back.out(1.5)" });
}

function updateProgress(isInitial = false, justCompleted = false) {
    if (state.habits.length === 0) {
        DOM.progressText.textContent = "0/0";
        gsap.to(DOM.progressBar, { width: "0%", duration: 0.5, ease: "power2.out" });
        return;
    }

    const completedCount = state.habits.filter(h => h.completed).length;
    const totalCount = state.habits.length;
    const percentage = (completedCount / totalCount) * 100;

    DOM.progressText.textContent = `${completedCount}/${totalCount}`;
    
    gsap.to(DOM.progressBar, { 
        width: `${percentage}%`, 
        duration: isInitial ? 1 : 0.8, 
        ease: "elastic.out(1, 0.7)" 
    });

    if (justCompleted) {
        if (percentage === 100) {
            setMascotMessage(getRandomMessage(messages.done));
            if (state.lastCompletedDate !== state.today) {
                state.streak++;
                state.lastCompletedDate = state.today;
                
                // Reward logic
                let earned = 10;
                let bigConfetti = false;
                if (state.streak % 7 === 0) {
                    earned += 50; // Perfect week!
                    bigConfetti = true;
                }
                state.carrots += earned;
                renderCarrots();
                
                saveTodayToHistory();
                renderStreak();
                renderHeatmap();
                
                gsap.to(DOM.streakCount.parentElement, {
                    scale: 1.2,
                    rotation: 5,
                    yoyo: true,
                    repeat: 3,
                    duration: 0.2,
                    ease: "power1.inOut"
                });
                
                animateThreeCelebration();
                fireConfetti(bigConfetti);
            } else {
                animateThreeClick(); 
            }
        } else {
            setMascotMessage(getRandomMessage(messages.middle));
            animateThreeClick();
        }
        showBunnyPopup();
    } else if (!isInitial) {
        saveTodayToHistory();
        renderHeatmap();
    }
}

function setMascotMessage(msg) {
    DOM.mascotMessage.textContent = msg;
    gsap.fromTo(DOM.mascotMessage, 
        { scale: 0.9, opacity: 0.8 }, 
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }
    );
}

function getRandomMessage(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function renderCarrots() {
    DOM.carrotCount.textContent = state.carrots;
}

function renderFreezes() {
    DOM.freezeCount.textContent = state.streakFreezes;
    if (state.streakFreezes > 0) {
        DOM.freezeDisplay.style.display = 'flex';
    } else {
        DOM.freezeDisplay.style.display = 'none';
    }
}

function renderStreak() {
    DOM.streakCount.textContent = state.streak;
}

function fireConfetti(isBig = false) {
    if (isBig) {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    } else {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 10000
        });
    }
}

function createHabitElement(habit) {
    const li = document.createElement('div');
    li.className = `habit-item ${habit.completed ? 'completed' : ''}`;
    li.dataset.id = habit.id;
    
    li.innerHTML = `
        <div class="habit-info">
            <div class="check-circle"></div>
            <span class="habit-name">${habit.name}</span>
        </div>
        <button class="delete-btn" aria-label="Delete">✖</button>
    `;
    
    li.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) return;
        
        habit.completed = !habit.completed;
        
        if (!habit.completed && state.lastCompletedDate === state.today) {
            state.streak = Math.max(0, state.streak - 1);
            state.lastCompletedDate = null;
            renderStreak();
        }
        
        if (habit.completed) {
            li.classList.add('completed');
            gsap.fromTo(li, 
                { scale: 1 }, 
                { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut", clearProps: "all" }
            );
            const check = li.querySelector('.check-circle');
            gsap.from(check, { scale: 0, rotation: -180, duration: 0.4, ease: "back.out(2)" });
            saveState();
            saveTodayToHistory();
            updateProgress(false, true); 
        } else {
            li.classList.remove('completed');
            saveState();
            saveTodayToHistory();
            updateProgress(false, false);
        }
    });
    
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        gsap.to(li, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                state.habits = state.habits.filter(h => h.id !== habit.id);
                saveState();
                saveTodayToHistory();
                li.remove();
                updateProgress();
                renderHeatmap();
            }
        });
    });
    
    return li;
}

function renderHabits(isInitial = false) {
    DOM.habitList.innerHTML = '';
    
    state.habits.forEach(habit => {
        const li = createHabitElement(habit);
        DOM.habitList.appendChild(li);
    });
    
    if (isInitial && state.habits.length > 0) {
        gsap.from('.habit-item', {
            x: -50,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: "back.out(1.2)",
            delay: 0.8,
            clearProps: "all"
        });
    }
}

function setupEventListeners() {
    // Tab Navigation
    DOM.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            
            // Update active button state
            DOM.navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active view
            DOM.tabViews.forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Pomodoro listeners
    DOM.pomoPlay.addEventListener('click', startPomo);
    DOM.pomoPause.addEventListener('click', pausePomo);
    DOM.pomoReset.addEventListener('click', resetPomo);
    DOM.tabFocus.addEventListener('click', () => switchPomoMode('focus'));
    DOM.tabBreak.addEventListener('click', () => switchPomoMode('break'));
    
    // Stats
    DOM.statsBtn.addEventListener('click', renderStatsModal);
    DOM.statsCloseBtn.addEventListener('click', () => {
        gsap.to(DOM.statsModal.querySelector('.modal-content'), { scale: 0.8, duration: 0.2, ease: "power1.in" });
        gsap.to(DOM.statsModal, { autoAlpha: 0, duration: 0.2, delay: 0.1, onComplete: () => {
            gsap.set(DOM.statsModal, { display: 'none' });
        }});
    });

    // Distraction interactions
    DOM.distractBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reason = e.target.getAttribute('data-reason');
            state.distractions[reason] = (state.distractions[reason] || 0) + 1;
            saveState();
            
            gsap.to(DOM.distractionModal.querySelector('.modal-content'), { scale: 0.8, duration: 0.2, ease: "power1.in" });
            gsap.to(DOM.distractionModal, { autoAlpha: 0, duration: 0.2, delay: 0.1, onComplete: () => {
                gsap.set(DOM.distractionModal, { display: 'none' });
            }});
        });
    });
    
    // Visibility Change (Detect leaving tab)
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            pomo.hiddenTime = Date.now();
        } else {
            if (pomo.isRunning && pomo.mode === 'focus' && pomo.hiddenTime > 0) {
                const awayTime = Date.now() - pomo.hiddenTime;
                if (awayTime > 5000) { // Away for more than 5 seconds
                    gsap.to(DOM.distractionModal, { display: 'flex', autoAlpha: 1, duration: 0.2 });
                    gsap.to(DOM.distractionModal.querySelector('.modal-content'), { scale: 1, duration: 0.4, ease: "back.out(1.5)" });
                }
            }
            pomo.hiddenTime = 0;
        }
    });

    DOM.addHabitBtn.addEventListener('click', () => {
        gsap.to(DOM.addModal, { display: 'flex', autoAlpha: 1, duration: 0.2 });
        gsap.to(DOM.addModal.querySelector('.modal-content'), { scale: 1, duration: 0.4, ease: "back.out(1.5)" });
        
        gsap.fromTo(DOM.addHabitBtn, 
            { scale: 1 }, 
            { scale: 0.9, yoyo: true, repeat: 1, duration: 0.1 }
        );
        
        setTimeout(() => DOM.newHabitInput.focus(), 100);
    });
    
    DOM.cancelBtn.addEventListener('click', () => {
        gsap.to(DOM.addModal.querySelector('.modal-content'), { scale: 0.8, duration: 0.2, ease: "power1.in" });
        gsap.to(DOM.addModal, { autoAlpha: 0, duration: 0.2, delay: 0.1, onComplete: () => {
            gsap.set(DOM.addModal, { display: 'none' });
            DOM.newHabitInput.value = '';
        }});
    });
    
    DOM.saveBtn.addEventListener('click', () => {
        const name = DOM.newHabitInput.value.trim();
        if (name) {
            const newHabit = {
                id: Date.now().toString(),
                name: name,
                completed: false,
                note: ""
            };
            state.habits.push(newHabit);
            saveState();
            saveTodayToHistory();
            
            const li = createHabitElement(newHabit);
            DOM.habitList.appendChild(li);
            
            gsap.from(li, {
                scale: 0.5,
                opacity: 0,
                y: -20,
                duration: 0.4,
                ease: "back.out(1.5)",
                clearProps: "all"
            });
            
            updateProgress();
            renderHeatmap();
            DOM.cancelBtn.click();
        }
    });
    
    DOM.newHabitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            DOM.saveBtn.click();
        }
    });
    
    DOM.bunnyCanvas.addEventListener('click', () => {
        animateThreeClick();
    });

    DOM.continueBtn.addEventListener('click', () => {
        hideBunnyPopup();
    });
    
    DOM.historyCloseBtn.addEventListener('click', () => {
        gsap.to(DOM.historyModal.querySelector('.modal-content'), { scale: 0.8, duration: 0.2, ease: "power1.in" });
        gsap.to(DOM.historyModal, { autoAlpha: 0, duration: 0.2, delay: 0.1, onComplete: () => {
            gsap.set(DOM.historyModal, { display: 'none' });
        }});
    });

    // Header Currency click switches to Shop tab
    DOM.shopBtn.addEventListener('click', () => {
        const shopNavBtn = Array.from(DOM.navBtns).find(b => b.getAttribute('data-target') === 'shop-view');
        if (shopNavBtn) shopNavBtn.click();
    });

    DOM.buyFreezeBtn.addEventListener('click', () => {
        if (state.carrots >= 30) {
            state.carrots -= 30;
            state.streakFreezes++;
            saveState();
            renderCarrots();
            renderFreezes();
            updateBuyBtn();
            twemoji.parse(document.body);
            
            // Celebration effect
            gsap.fromTo(DOM.freezeDisplay, 
                { scale: 1 },
                { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut" }
            );
        }
    });
}

function updateBuyBtn() {
    if (state.carrots >= 30) {
        DOM.buyFreezeBtn.disabled = false;
    } else {
        DOM.buyFreezeBtn.disabled = true;
    }
}

init();
