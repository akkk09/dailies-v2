// 1. HELPER: getLocalDate()
function getLocalDate(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// 2. DOM Object
const DOM = {
    appContainer: document.getElementById('app-container'),
    header: document.querySelector('header'),
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
    progressBunny: document.getElementById('progress-bunny'),
    
    habitList: document.getElementById('habit-list'),
    addHabitBtn: document.getElementById('add-habit-btn'),
    addModal: document.getElementById('add-modal'),
    modalContent: document.getElementById('modal-content') || document.querySelector('.modal-content'),
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
    
    carrotCount: document.getElementById('carrot-count'),
    freezeDisplay: document.getElementById('freeze-display'),
    freezeCount: document.getElementById('freeze-count'),
    shopBtn: document.getElementById('shop-btn'),
    buyFreezeBtn: document.getElementById('buy-freeze-btn'),
    
    shopCarrotDisplay: document.getElementById('shop-carrot-display'),
    buyHatBtn: document.getElementById('buy-hat-btn'),
    buyGlassesBtn: document.getElementById('buy-glasses-btn'),
    buyCrownBtn: document.getElementById('buy-crown-btn'),
    buyWandBtn: document.getElementById('buy-wand-btn'),
    
    darkModeBtn: document.getElementById('dark-mode-btn'),
    
    levelBadge: document.getElementById('level-badge'),
    xpBar: document.getElementById('xp-bar'),
    xpText: document.getElementById('xp-text'),
    
    milestoneModal: document.getElementById('milestone-modal'),
    milestoneIcon: document.getElementById('milestone-icon'),
    milestoneTitle: document.getElementById('milestone-title'),
    milestoneDesc: document.getElementById('milestone-desc'),
    milestoneCloseBtn: document.getElementById('milestone-close-btn'),
    
    categoryBtns: document.querySelectorAll('.cat-btn')
};

// 3. State Object
let state = {
    habits: JSON.parse(localStorage.getItem('bunny_habits')) || [
        { id: '1', name: 'Drink water', completed: false, category: 'health' },
        { id: '2', name: 'Stretch for 5 mins', completed: false, category: 'selfcare' }
    ],
    streak: parseInt(localStorage.getItem('bunny_streak')) || 0,
    lastCompletedDate: localStorage.getItem('bunny_last_date') || null,
    currentDate: localStorage.getItem('bunny_current_date') || getLocalDate(),
    today: getLocalDate(),
    history: JSON.parse(localStorage.getItem('bunny_history')) || {},
    distractions: JSON.parse(localStorage.getItem('bunny_distractions')) || { texting: 0, watching: 0, studying: 0, other: 0 },
    carrots: parseInt(localStorage.getItem('bunny_carrots')) || 0,
    streakFreezes: parseInt(localStorage.getItem('bunny_streak_freezes')) || 0,
    totalFocusTime: parseInt(localStorage.getItem('bunny_total_focus')) || 0,
    focusSessions: parseInt(localStorage.getItem('bunny_focus_sessions')) || 0,
    xp: parseInt(localStorage.getItem('bunny_xp')) || 0,
    level: parseInt(localStorage.getItem('bunny_level')) || 1,
    ownedItems: JSON.parse(localStorage.getItem('bunny_owned_items')) || [],
    equippedItems: JSON.parse(localStorage.getItem('bunny_equipped_items')) || [],
    darkMode: localStorage.getItem('bunny_dark_mode') === 'true',
    lastLoginDate: localStorage.getItem('bunny_last_login') || null,
    reminderTime: localStorage.getItem('bunny_reminder_time') || null,
    lastMilestone: parseInt(localStorage.getItem('bunny_last_milestone')) || 0,
    todayMood: localStorage.getItem('bunny_today_mood') || null
};

// 4. Pomo Object
let pomo = { timeLeft: 25 * 60, timerId: null, isRunning: false, mode: 'focus', hiddenTime: 0 };

// 5. Messages (mood-aware)
const messages = {
    start: ["Hi cutie! Ready to crush your goals today? 💕", "Let's have a wonderful day! 🌸", "I believe in you! 💖"],
    middle: ["You're doing amazing! Keep going! ✨", "So proud of you! 🥰", "Almost there cutie! 🥕"],
    done: ["YAY! Perfect day! You're the best! 🎉", "All done! I love you! 💕", "Wow! You're unstoppable! 🌟"]
};

const moodMessages = {
    great: {
        start: ["Yay! You're glowing today! Let's make it amazing! ✨", "Your energy is contagious! 🌟", "I love seeing you happy! Let's gooo! 💖"],
        habit: ["You're on fire today! 🔥", "That's the spirit! Keep shining! ✨", "Nothing can stop you today! 💪"]
    },
    good: {
        start: ["Good vibes today! Let's keep it going! 🌸", "What a lovely day to be productive! 🌻", "You've got this cutie! 💕"],
        habit: ["Nice work! You're doing great! 🌈", "One step at a time! 💫", "Keep it up sweetheart! 🥰"]
    },
    okay: {
        start: ["Hey! Even okay days are worth showing up for 💛", "Some days are just okay, and that's perfectly fine! 🌼", "I'm here with you today! 💕"],
        habit: ["Every little bit counts! 🌿", "You're still going, that's what matters! 💚", "Proud of you for trying! 🌸"]
    },
    sad: {
        start: ["I'm so proud you showed up today 💕", "Hey, it's okay to feel sad. I'm right here with you 🫂", "Sending you the biggest bunny hug 🐰💗", "Bad days don't last forever, but I'll always be here 💕"],
        habit: ["You're so brave for doing this today 💗", "Even on hard days, you're amazing 🌸", "One tiny step — that's all you need 💛", "I'm so proud of every single thing you do today 🥺"]
    },
    rough: {
        start: ["Hey... I know today is tough. But you opened this app, and that already makes you incredible 💕", "You don't have to be perfect today. Just be here. I love you 🫂", "The fact that you're trying means everything to me 🐰💗"],
        habit: ["You absolute warrior 💪💕", "This took so much strength. I see you 🥺", "Every habit today is worth double because you're pushing through 🌟", "I'm literally the proudest bunny right now 🐰✨"]
    }
};

const MOOD_EMOJIS = { great: '😊', good: '🙂', okay: '😐', sad: '😔', rough: '😢' };
const MOOD_LABELS = { great: 'Great', good: 'Good', okay: 'Okay', sad: 'Sad', rough: 'Rough' };

// 6. Level System Constants
const LEVELS = [
    { level: 1, name: 'Baby Bunny', xpNeeded: 0 },
    { level: 2, name: 'Growing Bunny', xpNeeded: 100 },
    { level: 3, name: 'Teen Bunny', xpNeeded: 300 },
    { level: 4, name: 'Adult Bunny', xpNeeded: 600 },
    { level: 5, name: 'Super Bunny', xpNeeded: 1000 }
];

const SHOP_ITEMS = [
    { id: 'hat', name: 'Party Hat', cost: 20, emoji: '🎩' },
    { id: 'glasses', name: 'Sunglasses', cost: 40, emoji: '😎' },
    { id: 'crown', name: 'Crown', cost: 80, emoji: '👑' },
    { id: 'wand', name: 'Star Wand', cost: 60, emoji: '⭐' }
];

const MILESTONES = [
    { days: 7, icon: '🗡️', title: 'One Week Warrior!', desc: '7 days of pure dedication!' },
    { days: 14, icon: '💪', title: 'Two Week Titan!', desc: '14 days! Unstoppable!' },
    { days: 30, icon: '👑', title: 'Monthly Master!', desc: '30 days! You are royalty!' },
    { days: 100, icon: '💎', title: 'LEGENDARY!', desc: '100 days! You are a legend!' }
];

// 7. Three.js Setup (initThreeJS)
let scene, camera, renderer, bunnyGroup, clock, mixer;
let leftFoot, rightFoot;
let accessoryGroup; // THREE.Group added to bunnyGroup
let isJumping = false;
let jumpTween;

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 2, 8);
    
    renderer = new THREE.WebGLRenderer({ canvas: DOM.bunnyCanvas, alpha: true, antialias: true });
    renderer.setSize(200, 200);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    
    bunnyGroup = new THREE.Group();
    scene.add(bunnyGroup);
    
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const pinkMat = new THREE.MeshLambertMaterial({ color: 0xffb6c1 });
    const blackMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    
    // Body - squished sphere for a round chubby body
    const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    body.scale.set(1, 1.1, 0.9);
    body.position.y = 0;
    bunnyGroup.add(body);
    
    // Head
    const headGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const head = new THREE.Mesh(headGeo, whiteMat);
    head.position.y = 1.5;
    bunnyGroup.add(head);
    
    // Ears - elongated spheres
    const earGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, whiteMat);
    leftEar.scale.set(0.6, 2.2, 0.5);
    leftEar.position.set(-0.5, 3.0, 0);
    leftEar.rotation.z = 0.15;
    bunnyGroup.add(leftEar);
    const rightEar = new THREE.Mesh(earGeo, whiteMat);
    rightEar.scale.set(0.6, 2.2, 0.5);
    rightEar.position.set(0.5, 3.0, 0);
    rightEar.rotation.z = -0.15;
    bunnyGroup.add(rightEar);
    
    // Inner Ears - smaller pink elongated spheres
    const innerEarGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const leftInner = new THREE.Mesh(innerEarGeo, pinkMat);
    leftInner.scale.set(0.5, 1.8, 0.3);
    leftInner.position.set(0, 0, 0.15);
    leftEar.add(leftInner);
    const rightInner = new THREE.Mesh(innerEarGeo, pinkMat);
    rightInner.scale.set(0.5, 1.8, 0.3);
    rightInner.position.set(0, 0, 0.15);
    rightEar.add(rightInner);
    
    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, blackMat);
    leftEye.position.set(-0.4, 1.7, 1.1);
    bunnyGroup.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, blackMat);
    rightEye.position.set(0.4, 1.7, 1.1);
    bunnyGroup.add(rightEye);
    
    // Highlights
    const hlGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lHl = new THREE.Mesh(hlGeo, hlMat);
    lHl.position.set(-0.05, 0.05, 0.12);
    leftEye.add(lHl);
    const rHl = new THREE.Mesh(hlGeo, hlMat);
    rHl.position.set(-0.05, 0.05, 0.12);
    rightEye.add(rHl);
    
    // Nose
    const noseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const nose = new THREE.Mesh(noseGeo, pinkMat);
    nose.position.set(0, 1.4, 1.2);
    bunnyGroup.add(nose);
    
    // Blush
    const blushGeo = new THREE.CircleGeometry(0.2, 16);
    const lBlush = new THREE.Mesh(blushGeo, pinkMat);
    lBlush.position.set(-0.6, 1.3, 1.1);
    lBlush.rotation.y = -0.2;
    bunnyGroup.add(lBlush);
    const rBlush = new THREE.Mesh(blushGeo, pinkMat);
    rBlush.position.set(0.6, 1.3, 1.1);
    rBlush.rotation.y = 0.2;
    bunnyGroup.add(rBlush);
    
    // Arms - small round spheres
    const armGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const leftArm = new THREE.Mesh(armGeo, whiteMat);
    leftArm.scale.set(0.8, 1.2, 0.8);
    leftArm.position.set(-1.1, 0.2, 0);
    bunnyGroup.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, whiteMat);
    rightArm.scale.set(0.8, 1.2, 0.8);
    rightArm.position.set(1.1, 0.2, 0);
    bunnyGroup.add(rightArm);
    
    // Feet - oval spheres sticking out front
    const footGeo = new THREE.SphereGeometry(0.35, 16, 16);
    leftFoot = new THREE.Mesh(footGeo, whiteMat);
    leftFoot.scale.set(0.7, 0.5, 1.2);
    leftFoot.position.set(-0.5, -0.9, 0.5);
    bunnyGroup.add(leftFoot);
    rightFoot = new THREE.Mesh(footGeo, whiteMat);
    rightFoot.scale.set(0.7, 0.5, 1.2);
    rightFoot.position.set(0.5, -0.9, 0.5);
    bunnyGroup.add(rightFoot);
    
    // Toe beans! tiny pink spheres on feet
    const beanGeo = new THREE.SphereGeometry(0.06, 8, 8);
    for (let foot of [leftFoot, rightFoot]) {
        const bean1 = new THREE.Mesh(beanGeo, pinkMat);
        bean1.position.set(-0.1, 0.15, 0.2);
        foot.add(bean1);
        const bean2 = new THREE.Mesh(beanGeo, pinkMat);
        bean2.position.set(0.1, 0.15, 0.2);
        foot.add(bean2);
        const bean3 = new THREE.Mesh(beanGeo, pinkMat);
        bean3.position.set(0, 0.15, 0.3);
        foot.add(bean3);
        // Big pad
        const padGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const pad = new THREE.Mesh(padGeo, pinkMat);
        pad.position.set(0, 0.12, 0);
        foot.add(pad);
    }
    
    // Tail - fluffy pom
    const tailGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const tail = new THREE.Mesh(tailGeo, whiteMat);
    tail.position.set(0, -0.3, -0.9);
    bunnyGroup.add(tail);
    
    // Accessory Group
    accessoryGroup = new THREE.Group();
    bunnyGroup.add(accessoryGroup);
    
    clock = new THREE.Clock();
    
    // Handle resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Initial accessories
    renderAccessories();
    
    animateThree();
}

function renderAccessories() {
    if (!accessoryGroup) return;
    
    // Clear old accessories
    while(accessoryGroup.children.length > 0){ 
        const child = accessoryGroup.children[0];
        accessoryGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
    }
    
    if (state.equippedItems.includes('hat')) {
        const hatGeo = new THREE.ConeGeometry(0.3, 0.6, 16);
        const hatMat = new THREE.MeshLambertMaterial({ color: 0xffb6c1 });
        const hat = new THREE.Mesh(hatGeo, hatMat);
        hat.position.set(0, 2.9, 0); // Moved up (head top is at 2.7)
        
        const tipGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const tipMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(0, 0.3, 0);
        hat.add(tip);
        
        accessoryGroup.add(hat);
    }
    
    if (state.equippedItems.includes('glasses')) {
        const glassesGroup = new THREE.Group();
        const lensGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 16);
        const lensMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        
        const lLens = new THREE.Mesh(lensGeo, lensMat);
        lLens.position.set(-0.4, 1.7, 1.25);
        glassesGroup.add(lLens);
        
        const rLens = new THREE.Mesh(lensGeo, lensMat);
        rLens.position.set(0.4, 1.7, 1.25);
        glassesGroup.add(rLens);
        
        const bridgeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
        const bridge = new THREE.Mesh(bridgeGeo, lensMat);
        bridge.position.set(0, 1.7, 1.25);
        bridge.rotation.z = Math.PI / 2;
        glassesGroup.add(bridge);
        
        // Add temples (arms of glasses)
        const lTemple = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8), lensMat);
        lTemple.position.set(-0.6, 1.7, 0.85);
        lTemple.rotation.x = Math.PI / 2;
        glassesGroup.add(lTemple);
        
        const rTemple = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8), lensMat);
        rTemple.position.set(0.6, 1.7, 0.85);
        rTemple.rotation.x = Math.PI / 2;
        glassesGroup.add(rTemple);
        
        accessoryGroup.add(glassesGroup);
    }
    
    if (state.equippedItems.includes('crown')) {
        const crownGeo = new THREE.TorusGeometry(0.35, 0.08, 8, 6);
        const crownMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.set(0, 2.65, 0); // Moved up
        crown.rotation.x = Math.PI / 2;
        
        for (let i=0; i<6; i++) {
            const spikeGeo = new THREE.ConeGeometry(0.05, 0.2, 4);
            const spike = new THREE.Mesh(spikeGeo, crownMat);
            spike.position.set(Math.cos(i * Math.PI / 3) * 0.35, Math.sin(i * Math.PI / 3) * 0.35, 0.1);
            spike.rotation.x = Math.PI / 2;
            crown.add(spike);
        }
        
        accessoryGroup.add(crown);
    }
    
    if (state.equippedItems.includes('wand')) {
        const wandGroup = new THREE.Group();
        
        const stickGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8);
        const stickMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const stick = new THREE.Mesh(stickGeo, stickMat);
        
        const starGeo = new THREE.DodecahedronGeometry(0.15);
        const starMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(0, 0.5, 0);
        
        wandGroup.add(stick);
        wandGroup.add(star);
        
        wandGroup.position.set(1.2, 0.5, 0.6); // Moved outward to not clip with arm
        wandGroup.rotation.z = -0.3;
        wandGroup.rotation.x = 0.3;
        accessoryGroup.add(wandGroup);
    }
}

function onWindowResize() {
    // Canvas is fixed 200x200
}

function animateThree() {
    requestAnimationFrame(animateThree);
    const t = clock.getElapsedTime();
    
    if (!isJumping && bunnyGroup) {
        bunnyGroup.position.y = Math.sin(t * 3) * 0.1;
        
        if (leftFoot && rightFoot) {
            leftFoot.position.y = -0.9 + Math.sin(t * 4) * 0.03;
            rightFoot.position.y = -0.9 + Math.cos(t * 4) * 0.03;
        }
    }
    
    renderer.render(scene, camera);
}

function animateThreeCelebration() {
    isJumping = true;
    if (jumpTween) jumpTween.kill();
    jumpTween = gsap.to(bunnyGroup.position, {
        y: 1.5,
        duration: 0.3,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut",
        onComplete: () => { isJumping = false; }
    });
    
    gsap.to(bunnyGroup.rotation, {
        y: Math.PI * 2,
        duration: 1.2,
        ease: "power1.inOut",
        onComplete: () => { bunnyGroup.rotation.y = 0; }
    });
}

function animateThreeClick() {
    if (isJumping) return;
    isJumping = true;
    if (jumpTween) jumpTween.kill();
    jumpTween = gsap.to(bunnyGroup.position, {
        y: 0.5,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
        onComplete: () => { isJumping = false; }
    });
}

// 8. App Logic Setup
gsap.set([DOM.addModal, DOM.historyModal, DOM.distractionModal, DOM.statsModal, DOM.milestoneModal], { display: 'none', autoAlpha: 0 });
gsap.set(DOM.modalContent, { scale: 0.5 });
gsap.set(DOM.progressBar, { width: "0%" });
if (DOM.bunnyPopup) gsap.set(DOM.bunnyPopup, { autoAlpha: 0 });
if (DOM.bunnyContainer) gsap.set(DOM.bunnyContainer, { y: '100%' });

function showBunnyPopup() {
    if (!DOM.bunnyPopup) return;
    gsap.to(DOM.bunnyPopup, { autoAlpha: 1, duration: 0.3 });
    gsap.to(DOM.bunnyContainer, { y: '0%', duration: 0.5, ease: "back.out(1.2)" });
    animateThreeCelebration();
}

function hideBunnyPopup() {
    if (!DOM.bunnyPopup) return;
    gsap.to(DOM.bunnyContainer, { y: '100%', duration: 0.4, ease: "back.in(1.2)" });
    gsap.to(DOM.bunnyPopup, { autoAlpha: 0, duration: 0.3, delay: 0.2 });
}

// 9. getGreeting() function
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        const options = ["Good morning sunshine! ☀️", "Rise and shine cutie! 🌅", "Morning! Let's be amazing today! 🌸"];
        return options[Math.floor(Math.random() * options.length)];
    } else if (hour >= 12 && hour < 17) {
        const options = ["Good afternoon! Keep going! 🌻", "Afternoon grind time! 💪", "Halfway through the day! You got this! 🌈"];
        return options[Math.floor(Math.random() * options.length)];
    } else if (hour >= 17 && hour < 21) {
        const options = ["Good evening! Almost done! 🌆", "Evening check-in! How are we doing? 🌙", "Let's finish strong tonight! ✨"];
        return options[Math.floor(Math.random() * options.length)];
    } else {
        const options = ["Late night hero! 🌙", "Burning the midnight oil! 🦉", "Night owl vibes! You're amazing! 💫"];
        return options[Math.floor(Math.random() * options.length)];
    }
}

function setMascotMessage(msg) {
    if (DOM.mascotMessage) {
        DOM.mascotMessage.textContent = msg;
        if (typeof twemoji !== 'undefined') twemoji.parse(DOM.mascotMessage);
    }
}

// 10. init() function
function init() {
    // Apply dark mode if saved
    if (state.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (DOM.darkModeBtn) DOM.darkModeBtn.textContent = '☀️';
    } else {
        if (DOM.darkModeBtn) DOM.darkModeBtn.textContent = '🌙';
    }
    
    initThreeJS();
    checkNewDay();
    checkDailyLogin();
    saveTodayToHistory();
    renderStreak();
    renderCarrots();
    renderFreezes();
    renderXP();
    updateAllShopButtons();
    renderHeatmap();
    renderHabits(true);
    updateProgress(true);
    renderAccessories();
    setupEventListeners();
    setupMoodPicker();
    setupDragAndDrop();
    updatePomoDisplay();
    setupNotifications();
    
    // Set mood-aware greeting
    if (state.todayMood && moodMessages[state.todayMood]) {
        const msgs = moodMessages[state.todayMood].start;
        setMascotMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    } else {
        setMascotMessage(getGreeting());
    }
    
    // Restore mood picker selection
    renderMoodSelection();
    
    // Parse twemoji
    if (typeof twemoji !== 'undefined') twemoji.parse(document.body);
    
    const tl = gsap.timeline();
    if (DOM.header) tl.from(DOM.header, { y: -50, opacity: 0, duration: 0.6, ease: "back.out(1.7)", clearProps: "all" });
    const habitsView = document.getElementById('habits-view');
    if (habitsView) tl.from(habitsView, { y: 20, opacity: 0, duration: 0.5, ease: "power2.out", clearProps: "all" }, "-=0.3");
    const nav = document.querySelector('.bottom-nav');
    if (nav) tl.from(nav, { y: 50, opacity: 0, duration: 0.5, ease: "back.out(1.2)", clearProps: "all" }, "-=0.4");
    
    // Show bunny on launch
    setTimeout(() => {
        showBunnyPopup();
    }, 800);
}

// 11. checkDailyLogin()
function checkDailyLogin() {
    if (state.lastLoginDate !== state.today) {
        state.lastLoginDate = state.today;
        state.carrots += 5; // Daily login bonus
        saveState();
        // Show a cute toast after a short delay
        setTimeout(() => {
            showToast('Welcome back! +5 🥕 daily bonus!');
        }, 1500);
    }
}

// 12. showToast(message)
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.backgroundColor = 'var(--card-bg)';
    toast.style.border = '2px solid var(--primary)';
    toast.style.padding = '10px 18px';
    toast.style.borderRadius = '20px';
    toast.style.fontWeight = '700';
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '300';
    toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
    if (state.darkMode) {
        toast.style.color = '#fff';
    }
    
    document.body.appendChild(toast);
    if (typeof twemoji !== 'undefined') twemoji.parse(toast);
    
    gsap.fromTo(toast, 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.5)" }
    );
    
    setTimeout(() => {
        gsap.to(toast, { y: -20, opacity: 0, duration: 0.3, onComplete: () => {
            toast.remove();
        }});
    }, 2500);
}

// 13. checkNewDay() - FIXED for multi-day freezes
function checkNewDay() {
    if (state.currentDate !== state.today) {
        state.habits.forEach(h => {
            h.completed = false;
            h.note = "";
        });
        state.todayMood = null; // Reset mood for new day
        
        if (state.lastCompletedDate) {
            const lastDate = new Date(state.lastCompletedDate + 'T12:00:00');
            const todayDate = new Date(state.today + 'T12:00:00');
            const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                // Try to use freezes for each missed day
                const missedDays = diffDays - 1;
                let frozenCount = 0;
                
                for (let i = 1; i <= missedDays; i++) {
                    if (state.streakFreezes > 0) {
                        state.streakFreezes--;
                        frozenCount++;
                        // Mark each missed day as frozen in history
                        const missedDate = new Date(lastDate);
                        missedDate.setDate(missedDate.getDate() + i);
                        const missedStr = getLocalDate(missedDate);
                        if (!state.history[missedStr]) {
                            state.history[missedStr] = { habits: [], frozen: true };
                        } else {
                            state.history[missedStr].frozen = true;
                        }
                    } else {
                        state.streak = 0;
                        break;
                    }
                }
                
                if (frozenCount === missedDays) {
                    // All days were covered by freezes
                    const lastFrozen = new Date(lastDate);
                    lastFrozen.setDate(lastFrozen.getDate() + missedDays);
                    state.lastCompletedDate = getLocalDate(lastFrozen);
                }
            }
        }
        
        state.currentDate = state.today;
        saveState();
    }
}

// 14. saveState()
function saveState() {
    localStorage.setItem('bunny_habits', JSON.stringify(state.habits));
    localStorage.setItem('bunny_streak', state.streak.toString());
    if (state.lastCompletedDate) {
        localStorage.setItem('bunny_last_date', state.lastCompletedDate);
    }
    localStorage.setItem('bunny_current_date', state.currentDate);
    localStorage.setItem('bunny_history', JSON.stringify(state.history));
    localStorage.setItem('bunny_distractions', JSON.stringify(state.distractions));
    localStorage.setItem('bunny_carrots', state.carrots.toString());
    localStorage.setItem('bunny_streak_freezes', state.streakFreezes.toString());
    localStorage.setItem('bunny_total_focus', state.totalFocusTime.toString());
    localStorage.setItem('bunny_focus_sessions', state.focusSessions.toString());
    localStorage.setItem('bunny_xp', state.xp.toString());
    localStorage.setItem('bunny_level', state.level.toString());
    localStorage.setItem('bunny_owned_items', JSON.stringify(state.ownedItems));
    localStorage.setItem('bunny_equipped_items', JSON.stringify(state.equippedItems));
    localStorage.setItem('bunny_dark_mode', state.darkMode.toString());
    if (state.lastLoginDate) {
        localStorage.setItem('bunny_last_login', state.lastLoginDate);
    }
    if (state.reminderTime) {
        localStorage.setItem('bunny_reminder_time', state.reminderTime);
    }
    localStorage.setItem('bunny_last_milestone', state.lastMilestone.toString());
    if (state.todayMood) {
        localStorage.setItem('bunny_today_mood', state.todayMood);
    }
}

function saveTodayToHistory() {
    const existingEntry = state.history[state.today];
    const isFrozen = existingEntry ? existingEntry.frozen : false;
    
    state.history[state.today] = {
        habits: JSON.parse(JSON.stringify(state.habits)),
        frozen: isFrozen,
        mood: state.todayMood || (existingEntry ? existingEntry.mood : null)
    };
    saveState();
}

// 15. Pomodoro Logic
function updatePomoDisplay() {
    if (!DOM.pomoDisplay) return;
    const m = Math.floor(pomo.timeLeft / 60).toString().padStart(2, '0');
    const s = (pomo.timeLeft % 60).toString().padStart(2, '0');
    DOM.pomoDisplay.textContent = `${m}:${s}`;
    document.title = `${m}:${s} - Bunny Habits`;
}

function startPomo() {
    if (pomo.isRunning) return;
    pomo.isRunning = true;
    if (DOM.pomoPlay) DOM.pomoPlay.style.display = 'none';
    if (DOM.pomoPause) DOM.pomoPause.style.display = 'inline-block';
    
    pomo.timerId = setInterval(() => {
        if (pomo.timeLeft > 0) {
            pomo.timeLeft--;
            if (pomo.mode === 'focus') {
                state.totalFocusTime++;
                if (pomo.timeLeft % 30 === 0) saveState();
            }
            updatePomoDisplay();
        } else {
            clearInterval(pomo.timerId);
            pomo.isRunning = false;
            if (pomo.mode === 'focus') {
                state.focusSessions++;
                saveState();
                sendNotification('Focus Complete!', 'Great job! Time for a break! 🐰');
                showToast('+1 Focus Session!');
                addXP(20);
                switchPomoMode('break');
            } else {
                sendNotification('Break Over!', 'Time to get back to work! 💪');
                switchPomoMode('focus');
            }
        }
    }, 1000);
}

function pausePomo() {
    if (!pomo.isRunning) return;
    clearInterval(pomo.timerId);
    pomo.isRunning = false;
    if (DOM.pomoPlay) DOM.pomoPlay.style.display = 'inline-block';
    if (DOM.pomoPause) DOM.pomoPause.style.display = 'none';
}

function resetPomo() {
    pausePomo();
    const customFocus = parseInt(document.getElementById('custom-focus-time')?.value) || 25;
    const customBreak = parseInt(document.getElementById('custom-break-time')?.value) || 5;
    pomo.timeLeft = pomo.mode === 'focus' ? customFocus * 60 : customBreak * 60;
    updatePomoDisplay();
}

function switchPomoMode(mode) {
    pomo.mode = mode;
    if (mode === 'focus') {
        if (DOM.tabFocus) DOM.tabFocus.classList.add('active');
        if (DOM.tabBreak) DOM.tabBreak.classList.remove('active');
    } else {
        if (DOM.tabBreak) DOM.tabBreak.classList.add('active');
        if (DOM.tabFocus) DOM.tabFocus.classList.remove('active');
    }
    resetPomo();
}

// 16. renderHeatmap()
function renderHeatmap() {
    if (!DOM.heatmapGrid) return;
    DOM.heatmapGrid.innerHTML = '';
    
    const today = new Date(state.today + 'T12:00:00');
    const pastDays = [];
    
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        pastDays.push(getLocalDate(d));
    }
    
    pastDays.forEach(dateStr => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        
        const historyData = state.history[dateStr];
        
        if (historyData) {
            if (historyData.frozen) {
                cell.classList.add('frozen');
                cell.title = `${dateStr}: Frozen ❄️`;
            } else if (historyData.habits && historyData.habits.length > 0) {
                const total = historyData.habits.length;
                const completed = historyData.habits.filter(h => h.completed).length;
                const percentage = (completed / total) * 100;
                
                if (percentage === 100) cell.classList.add('level-4');
                else if (percentage >= 75) cell.classList.add('level-3');
                else if (percentage >= 50) cell.classList.add('level-2');
                else if (percentage > 0) cell.classList.add('level-1');
                
                cell.title = `${dateStr}: ${completed}/${total} completed`;
            } else {
                cell.title = `${dateStr}: No habits`;
            }
        } else {
            cell.title = `${dateStr}: No data`;
        }
        
        cell.addEventListener('click', () => openHistoryModal(dateStr, historyData));
        DOM.heatmapGrid.appendChild(cell);
    });
}

// 17. openHistoryModal()
function openHistoryModal(dateStr, historyData) {
    if (!DOM.historyModal) return;
    if (DOM.historyDateTitle) DOM.historyDateTitle.textContent = dateStr;
    
    if (DOM.historyDetails) {
        DOM.historyDetails.innerHTML = '';
        
        if (!historyData) {
            DOM.historyDetails.innerHTML = '<p>No data for this date.</p>';
        } else if (historyData.frozen) {
            DOM.historyDetails.innerHTML = '<div style="text-align:center; padding: 20px;"><span style="font-size: 3rem;">❄️</span><p>Streak was frozen on this day!</p></div>';
        } else {
            let moodHtml = '';
            if (historyData.mood) {
                const emoji = MOOD_EMOJIS[historyData.mood] || '';
                const label = MOOD_LABELS[historyData.mood] || '';
                moodHtml = `<div style="text-align:center; padding: 10px; margin-bottom: 10px; background: var(--bg-color); border-radius: 15px;">
                    <span style="font-size: 2rem;">${emoji}</span>
                    <p style="font-weight: 700; color: var(--primary-dark); margin-top: 5px;">Feeling ${label}</p>
                </div>`;
            }
            
            if (historyData.habits && historyData.habits.length > 0) {
                DOM.historyDetails.innerHTML = moodHtml;
                historyData.habits.forEach(h => {
                    const item = document.createElement('div');
                    item.className = `habit-item ${h.completed ? 'completed' : ''}`;
                    item.style.marginBottom = '10px';
                    
                    item.innerHTML = `
                        <div class="habit-info">
                            <span class="cat-dot ${h.category || 'other'}"></span>
                            <div class="check-circle"></div>
                            <span class="habit-name">${h.name}</span>
                        </div>
                    `;
                    DOM.historyDetails.appendChild(item);
                });
            } else {
                DOM.historyDetails.innerHTML = moodHtml + '<p>No habits recorded.</p>';
            }
        }
    }
    
    gsap.set(DOM.historyModal, { display: 'flex' });
    gsap.to(DOM.historyModal, { autoAlpha: 1, duration: 0.3 });
    const content = DOM.historyModal.querySelector('.modal-content');
    if (content) {
        gsap.fromTo(content, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: "back.out(1.5)" });
    }
}

// 18. renderStatsModal() - ENHANCED TABBED VERSION
function renderStatsModal() {
    if (!DOM.statsContainer) return;
    
    const totalHours = Math.floor(state.totalFocusTime / 3600);
    const totalMins = Math.floor((state.totalFocusTime % 3600) / 60);
    
    // Weekly calculation
    const today = new Date(state.today + 'T12:00:00');
    let weekTasks = 0;
    let weekCompleted = 0;
    for(let i=0; i<7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = getLocalDate(d);
        const dayData = state.history[dateStr];
        if (dayData && !dayData.frozen && dayData.habits) {
            weekTasks += dayData.habits.length;
            weekCompleted += dayData.habits.filter(h=>h.completed).length;
        }
    }
    const weekRate = weekTasks ? Math.round((weekCompleted/weekTasks)*100) : 0;
    
    // Best/Worst day analysis (all history)
    const dayStats = { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] }; // 0=Sun
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    Object.keys(state.history).forEach(dateStr => {
        const d = state.history[dateStr];
        if (!d.frozen && d.habits && d.habits.length > 0) {
            const dateObj = new Date(dateStr + 'T12:00:00');
            const dayOfWeek = dateObj.getDay();
            const rate = d.habits.filter(h=>h.completed).length / d.habits.length;
            dayStats[dayOfWeek].push(rate);
        }
    });
    
    let bestDay = 'N/A', worstDay = 'N/A';
    let bestRate = -1, worstRate = 2;
    for (let i=0; i<7; i++) {
        if (dayStats[i].length > 0) {
            const avg = dayStats[i].reduce((a,b)=>a+b,0) / dayStats[i].length;
            if (avg > bestRate) { bestRate = avg; bestDay = dayNames[i]; }
            if (avg < worstRate) { worstRate = avg; worstDay = dayNames[i]; }
        }
    }

    const totalDistractions = Object.values(state.distractions).reduce((a, b) => a + b, 0) || 1;
    
    DOM.statsContainer.innerHTML = `
        <div id="stats-overview" class="stats-tab-content active" style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="stat-card" style="padding: 15px 10px;">
                    <h3>Total Focus</h3>
                    <div class="stat-value" style="font-size: 1.4rem;">${totalHours}h ${totalMins}m</div>
                </div>
                <div class="stat-card" style="padding: 15px 10px;">
                    <h3>Sessions</h3>
                    <div class="stat-value" style="font-size: 1.4rem;">${state.focusSessions}</div>
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Last 7 Days</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <div>
                        <p style="margin:0; font-size: 0.9rem;">Tasks: ${weekCompleted}/${weekTasks}</p>
                    </div>
                    <div class="stat-value" style="font-size: 1.8rem;">${weekRate}%</div>
                </div>
            </div>
        </div>

        <div id="stats-insights" class="stats-tab-content" style="display: none; flex-direction: column; gap: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="stat-card" style="padding: 12px 5px;">
                    <h3>Best Day</h3>
                    <div class="stat-value" style="font-size: 1.1rem; color: var(--success-dark);">${bestDay}</div>
                </div>
                <div class="stat-card" style="padding: 12px 5px;">
                    <h3>Needs Work</h3>
                    <div class="stat-value" style="font-size: 1.1rem; color: #ff6b6b;">${worstDay}</div>
                </div>
            </div>
            
            <div class="stat-card">
                <h3 style="margin-bottom: 10px;">Distractions</h3>
                <div class="stat-row" style="margin-bottom: 5px;">
                    <span style="font-size: 0.8rem;">📱 Texting (${state.distractions.texting})</span>
                    <div class="stat-bar-bg" style="height: 6px;"><div class="stat-bar-fill" style="width: ${(state.distractions.texting / totalDistractions) * 100}%"></div></div>
                </div>
                <div class="stat-row" style="margin-bottom: 5px;">
                    <span style="font-size: 0.8rem;">📺 Watching (${state.distractions.watching})</span>
                    <div class="stat-bar-bg" style="height: 6px;"><div class="stat-bar-fill" style="width: ${(state.distractions.watching / totalDistractions) * 100}%"></div></div>
                </div>
                <div class="stat-row" style="margin-bottom: 5px;">
                    <span style="font-size: 0.8rem;">📚 Studying (${state.distractions.studying})</span>
                    <div class="stat-bar-bg" style="height: 6px;"><div class="stat-bar-fill" style="width: ${(state.distractions.studying / totalDistractions) * 100}%"></div></div>
                </div>
                <div class="stat-row">
                    <span style="font-size: 0.8rem;">❓ Other (${state.distractions.other})</span>
                    <div class="stat-bar-bg" style="height: 6px;"><div class="stat-bar-fill" style="width: ${(state.distractions.other / totalDistractions) * 100}%"></div></div>
                </div>
            </div>
        </div>

        <div id="stats-settings" class="stats-tab-content" style="display: none; flex-direction: column; gap: 10px;">
            <div class="stat-card">
                <h3 style="margin-bottom: 10px;">Daily Reminder</h3>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="time" id="reminder-time" value="${state.reminderTime || ''}" style="padding: 8px; border-radius: 10px; border: 2px solid var(--border-color); flex: 1; font-family: 'Nunito';">
                    <button class="btn btn-primary" id="save-reminder-btn">Set</button>
                </div>
            </div>
            
            <button class="btn" id="enable-notif-btn" style="width: 100%; padding: 12px; background: var(--bg-color); border: 2px solid var(--border-color);">🔔 Enable Browser Notifications</button>
            <button class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 10px;" id="export-csv-btn">📥 Export Data (CSV)</button>
        </div>
    `;
    
    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.stats-tab-btn');
    const tabContents = document.querySelectorAll('.stats-tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.boxShadow = 'none';
            });
            e.target.classList.add('active');
            e.target.style.background = 'var(--card-bg)';
            e.target.style.boxShadow = '0 2px 0 var(--shadow-color)';
            
            tabContents.forEach(tc => tc.style.display = 'none');
            document.getElementById(e.target.dataset.target).style.display = 'flex';
        });
    });
    
    // Bind buttons
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);
    
    const saveRemBtn = document.getElementById('save-reminder-btn');
    const remInput = document.getElementById('reminder-time');
    if (saveRemBtn && remInput) {
        saveRemBtn.addEventListener('click', () => {
            if (remInput.value) {
                state.reminderTime = remInput.value;
                saveState();
                setupNotifications();
                showToast('Reminder saved!');
            }
        });
    }
    
    const enableNotif = document.getElementById('enable-notif-btn');
    if (enableNotif) {
        enableNotif.addEventListener('click', () => {
            if ('Notification' in window) {
                Notification.requestPermission().then(perm => {
                    if (perm === 'granted') showToast('Notifications enabled!');
                });
            }
        });
    }
}

// 19. XP & Level System
function addXP(amount) {
    state.xp += amount;
    const oldLevel = state.level;
    
    // Calculate new level
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (state.xp >= LEVELS[i].xpNeeded) {
            state.level = LEVELS[i].level;
            break;
        }
    }
    
    saveState();
    renderXP();
    
    if (state.level > oldLevel) {
        // Level up!
        showMilestoneModal('🎉', `Level ${state.level}!`, `You're now a ${LEVELS[state.level - 1].name}!`);
        fireConfetti(true);
    }
}

function renderXP() {
    if (!DOM.levelBadge || !DOM.xpBar || !DOM.xpText) return;
    
    DOM.levelBadge.textContent = `Lv ${state.level}`;
    
    let currentLevelXP = LEVELS[state.level - 1].xpNeeded;
    let nextLevelXP = state.level < LEVELS.length ? LEVELS[state.level].xpNeeded : currentLevelXP;
    
    if (state.level === LEVELS.length) {
        DOM.xpBar.style.width = '100%';
        DOM.xpText.textContent = `MAX LEVEL`;
    } else {
        const xpInLevel = state.xp - currentLevelXP;
        const xpNeededForNext = nextLevelXP - currentLevelXP;
        const percentage = (xpInLevel / xpNeededForNext) * 100;
        
        DOM.xpBar.style.width = `${percentage}%`;
        DOM.xpText.textContent = `${state.xp} / ${nextLevelXP} XP`;
    }
}

// 20. updateProgress()
function updateProgress(initial = false) {
    if (state.habits.length === 0) {
        if (DOM.progressText) DOM.progressText.textContent = "No habits yet!";
        if (DOM.progressBar) DOM.progressBar.style.width = "0%";
        if (DOM.progressBunny) DOM.progressBunny.style.left = "0%";
        return;
    }

    const completed = state.habits.filter(h => h.completed).length;
    const total = state.habits.length;
    const percentage = (completed / total) * 100;

    if (DOM.progressText) DOM.progressText.textContent = `${completed} / ${total} completed`;
    
    if (DOM.progressBar) {
        gsap.to(DOM.progressBar, {
            width: `${percentage}%`,
            duration: 0.8,
            ease: "power2.out"
        });
    }
    
    if (DOM.progressBunny) {
        gsap.to(DOM.progressBunny, {
            left: `${percentage}%`,
            duration: 0.8,
            ease: "power2.out"
        });
    }

    if (!initial) {
        if (percentage === 100) {
            setMascotMessage(messages.done[Math.floor(Math.random() * messages.done.length)]);
            
            // Handle perfect day
            if (state.lastCompletedDate !== state.today) {
                state.streak++;
                state.lastCompletedDate = state.today;
                
                let carrotsEarned = 10;
                let xpEarned = 50;
                
                if (state.streak % 7 === 0) {
                    carrotsEarned += 50;
                    xpEarned += 200;
                    showToast('Perfect Week! +50 🥕 +200 XP!');
                }
                
                state.carrots += carrotsEarned;
                addXP(xpEarned);
                
                saveState();
                renderStreak();
                renderCarrots();
                
                checkStreakMilestones();
                
                if (!document.getElementById('milestone-modal') || document.getElementById('milestone-modal').style.display === 'none') {
                    showBunnyPopup();
                    fireConfetti();
                }
            }
        } else if (percentage > 0) {
            setMascotMessage(messages.middle[Math.floor(Math.random() * messages.middle.length)]);
        } else {
            setMascotMessage(messages.start[Math.floor(Math.random() * messages.start.length)]);
        }
    }
}

// 21. checkStreakMilestones()
function checkStreakMilestones() {
    const milestone = MILESTONES.find(m => m.days === state.streak);
    if (milestone && state.lastMilestone !== state.streak) {
        state.lastMilestone = state.streak;
        saveState();
        showMilestoneModal(milestone.icon, milestone.title, milestone.desc);
        fireConfetti(true);
    }
}

// 22. showMilestoneModal()
function showMilestoneModal(icon, title, desc) {
    if (!DOM.milestoneModal) return;
    if (DOM.milestoneIcon) DOM.milestoneIcon.textContent = icon;
    if (DOM.milestoneTitle) DOM.milestoneTitle.textContent = title;
    if (DOM.milestoneDesc) DOM.milestoneDesc.textContent = desc;
    
    gsap.set(DOM.milestoneModal, { display: 'flex' });
    gsap.to(DOM.milestoneModal, { autoAlpha: 1, duration: 0.3 });
    const content = DOM.milestoneModal.querySelector('.modal-content');
    if (content) {
        gsap.fromTo(content, { scale: 0.5 }, { scale: 1, duration: 0.5, ease: "back.out(1.5)" });
    }
    
    if (typeof twemoji !== 'undefined') {
        twemoji.parse(DOM.milestoneIcon);
        twemoji.parse(DOM.milestoneTitle);
    }
}

// 23. renderHabits & createHabitElement
function renderHabits(initial = false) {
    if (!DOM.habitList) return;
    DOM.habitList.innerHTML = '';
    state.habits.forEach(habit => {
        DOM.habitList.appendChild(createHabitElement(habit));
    });
    if (!initial && typeof twemoji !== 'undefined') twemoji.parse(DOM.habitList);
}

function createHabitElement(habit) {
    const el = document.createElement('div');
    el.className = `habit-item ${habit.completed ? 'completed' : ''}`;
    el.dataset.id = habit.id;

    el.innerHTML = `
        <div class="habit-info">
            <span class="drag-handle" style="cursor: grab; padding-right: 10px; color: var(--text-muted); font-size: 1.2rem;">⠿</span>
            <span class="cat-dot ${habit.category || 'other'}"></span>
            <div class="check-circle"></div>
            <span class="habit-name">${habit.name}</span>
        </div>
        <button class="delete-btn" aria-label="Delete habit">❌</button>
    `;

    const infoSection = el.querySelector('.habit-info');
    infoSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('drag-handle')) return;
        
        habit.completed = !habit.completed;
        el.classList.toggle('completed');
        
        if (habit.completed) {
            gsap.from(el, { scale: 0.95, duration: 0.2, ease: "back.out(2)" });
            
            // Mood-aware XP: bonus on hard days
            let xpAmount = 10;
            if (state.todayMood === 'sad' || state.todayMood === 'rough') {
                xpAmount = 15; // +5 bonus for pushing through
            }
            addXP(xpAmount);
            
            // Mood-aware message
            if (state.todayMood && moodMessages[state.todayMood]) {
                const msgs = moodMessages[state.todayMood].habit;
                setMascotMessage(msgs[Math.floor(Math.random() * msgs.length)]);
            } else {
                setMascotMessage(messages.middle[Math.floor(Math.random() * messages.middle.length)]);
            }
            showBunnyPopup();
            
            animateThreeClick();
        }
        
        saveState();
        saveTodayToHistory();
        updateProgress();
    });

    const deleteBtn = el.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        gsap.to(el, {
            x: -50,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                state.habits = state.habits.filter(h => h.id !== habit.id);
                saveState();
                saveTodayToHistory();
                renderHabits();
                updateProgress();
            }
        });
    });

    return el;
}

// 24. Drag and Drop
function setupDragAndDrop() {
    if (!DOM.habitList) return;
    
    let draggedItem = null;
    
    DOM.habitList.addEventListener('pointerdown', (e) => {
        const handle = e.target.closest('.drag-handle');
        if (!handle) return;
        
        draggedItem = handle.closest('.habit-item');
        if (draggedItem) {
            draggedItem.classList.add('dragging');
            draggedItem.setPointerCapture(e.pointerId);
            // Optional: style changes while dragging
            gsap.to(draggedItem, { scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.1)", duration: 0.2 });
        }
    });
    
    DOM.habitList.addEventListener('pointermove', (e) => {
        if (!draggedItem) return;
        e.preventDefault(); // Prevent scrolling while dragging
        const afterElement = getDragAfterElement(DOM.habitList, e.clientY);
        if (afterElement) {
            DOM.habitList.insertBefore(draggedItem, afterElement);
        } else {
            DOM.habitList.appendChild(draggedItem);
        }
    });
    
    DOM.habitList.addEventListener('pointerup', (e) => {
        if (!draggedItem) return;
        draggedItem.releasePointerCapture(e.pointerId);
        draggedItem.classList.remove('dragging');
        gsap.to(draggedItem, { scale: 1, boxShadow: "none", duration: 0.2 });
        
        // Update state.habits order to match DOM
        const newOrder = [...DOM.habitList.children].map(el => el.dataset.id);
        state.habits.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
        saveState();
        saveTodayToHistory();
        
        draggedItem = null;
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.habit-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 25. setupEventListeners()
function setupEventListeners() {
    // Dark Mode Toggle
    if (DOM.darkModeBtn) {
        DOM.darkModeBtn.addEventListener('click', () => {
            state.darkMode = !state.darkMode;
            if (state.darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                DOM.darkModeBtn.textContent = '☀️';
            } else {
                document.documentElement.removeAttribute('data-theme');
                DOM.darkModeBtn.textContent = '🌙';
            }
            saveState();
            if (typeof twemoji !== 'undefined') twemoji.parse(DOM.darkModeBtn);
        });
    }
    
    // Category Picker in Add Modal
    let selectedCategory = 'other';
    if (DOM.categoryBtns) {
        DOM.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedCategory = btn.dataset.cat;
            });
        });
    }
    
    // Add Habit
    if (DOM.addHabitBtn) {
        DOM.addHabitBtn.addEventListener('click', () => {
            if (DOM.newHabitInput) DOM.newHabitInput.value = '';
            selectedCategory = 'other';
            if (DOM.categoryBtns) {
                DOM.categoryBtns.forEach(b => b.classList.remove('active'));
                const otherBtn = Array.from(DOM.categoryBtns).find(b => b.dataset.cat === 'other');
                if (otherBtn) otherBtn.classList.add('active');
            }
            gsap.set(DOM.addModal, { display: 'flex' });
            gsap.to(DOM.addModal, { autoAlpha: 1, duration: 0.2 });
            gsap.to(DOM.modalContent, { scale: 1, duration: 0.3, ease: "back.out(1.5)" });
            if (DOM.newHabitInput) DOM.newHabitInput.focus();
        });
    }

    if (DOM.cancelBtn) {
        DOM.cancelBtn.addEventListener('click', () => {
            gsap.to(DOM.modalContent, { scale: 0.5, duration: 0.2 });
            gsap.to(DOM.addModal, { autoAlpha: 0, duration: 0.2, onComplete: () => {
                gsap.set(DOM.addModal, { display: 'none' });
            }});
        });
    }

    if (DOM.saveBtn) {
        DOM.saveBtn.addEventListener('click', () => {
            if (DOM.newHabitInput) {
                const name = DOM.newHabitInput.value.trim();
                if (name) {
                    const newHabit = {
                        id: Date.now().toString(),
                        name: name,
                        completed: false,
                        category: selectedCategory
                    };
                    state.habits.push(newHabit);
                    saveState();
                    saveTodayToHistory();
                    
                    const el = createHabitElement(newHabit);
                    DOM.habitList.appendChild(el);
                    updateProgress();
                    
                    if (typeof twemoji !== 'undefined') twemoji.parse(el);
                    gsap.from(el, { y: 20, opacity: 0, duration: 0.4, ease: "back.out(1.5)" });
                    
                    gsap.to(DOM.modalContent, { scale: 0.5, duration: 0.2 });
                    gsap.to(DOM.addModal, { autoAlpha: 0, duration: 0.2, onComplete: () => {
                        gsap.set(DOM.addModal, { display: 'none' });
                    }});
                }
            }
        });
    }
    
    if (DOM.newHabitInput) {
        DOM.newHabitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                DOM.saveBtn.click();
            }
        });
    }
    
    // Tab Navigation
    if (DOM.navBtns) {
        DOM.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.navBtns.forEach(b => b.classList.remove('active'));
                DOM.tabViews.forEach(v => v.classList.remove('active'));
                
                btn.classList.add('active');
                const viewId = btn.dataset.tab + '-view';
                const viewEl = document.getElementById(viewId);
                if (viewEl) {
                    viewEl.classList.add('active');
                    gsap.fromTo(viewEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, clearProps: "all" });
                }
                
                if (btn.dataset.tab === 'shop') {
                    updateAllShopButtons();
                }
                
                if (typeof twemoji !== 'undefined') twemoji.parse(document.body);
            });
        });
    }
    
    // Pomo
    if (DOM.tabFocus) DOM.tabFocus.addEventListener('click', () => switchPomoMode('focus'));
    if (DOM.tabBreak) DOM.tabBreak.addEventListener('click', () => switchPomoMode('break'));
    if (DOM.pomoPlay) DOM.pomoPlay.addEventListener('click', startPomo);
    if (DOM.pomoPause) DOM.pomoPause.addEventListener('click', pausePomo);
    if (DOM.pomoReset) DOM.pomoReset.addEventListener('click', resetPomo);
    
    // Custom Pomo Inputs
    const customFocusInput = document.getElementById('custom-focus-time');
    const customBreakInput = document.getElementById('custom-break-time');
    if (customFocusInput) customFocusInput.addEventListener('change', resetPomo);
    if (customBreakInput) customBreakInput.addEventListener('change', resetPomo);
    
    // Pomo Presets
    const presetBtns = document.querySelectorAll('.pomo-preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            presetBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            if (customFocusInput) customFocusInput.value = e.target.dataset.focus;
            if (customBreakInput) customBreakInput.value = e.target.dataset.break;
            resetPomo();
        });
    });
    
    // Ambience
    const ambienceBtn = document.getElementById('ambience-toggle-btn');
    const ambienceAudio = document.getElementById('ambience-audio');
    if (ambienceBtn && ambienceAudio) {
        ambienceBtn.addEventListener('click', () => {
            if (ambienceAudio.paused) {
                ambienceAudio.play();
                ambienceBtn.textContent = '🎵 Lofi Beats (On)';
                ambienceBtn.style.borderColor = 'var(--primary-dark)';
                ambienceBtn.style.color = 'var(--primary-dark)';
            } else {
                ambienceAudio.pause();
                ambienceBtn.textContent = '🎵 Lofi Beats (Off)';
                ambienceBtn.style.borderColor = 'var(--border-color)';
                ambienceBtn.style.color = 'var(--text-main)';
            }
        });
    }
    
    // Shop Handlers
    const setupShopBtn = (btnId, itemId) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', () => {
            const itemDef = SHOP_ITEMS.find(i => i.id === itemId);
            if (!itemDef) return;
            
            if (state.equippedItems.includes(itemId)) {
                // Unequip
                state.equippedItems = state.equippedItems.filter(id => id !== itemId);
            } else if (state.ownedItems.includes(itemId)) {
                // Equip
                state.equippedItems.push(itemId);
            } else {
                // Buy
                if (state.carrots >= itemDef.cost) {
                    state.carrots -= itemDef.cost;
                    state.ownedItems.push(itemId);
                    showToast(`Bought ${itemDef.name}!`);
                    renderCarrots();
                } else {
                    gsap.to(btn, { x: 5, duration: 0.1, yoyo: true, repeat: 3 });
                    showToast("Not enough 🥕!");
                    return;
                }
            }
            saveState();
            renderAccessories();
            updateAllShopButtons();
            if (typeof twemoji !== 'undefined') twemoji.parse(btn.parentElement);
        });
    };
    
    setupShopBtn('buy-hat-btn', 'hat');
    setupShopBtn('buy-glasses-btn', 'glasses');
    setupShopBtn('buy-crown-btn', 'crown');
    setupShopBtn('buy-wand-btn', 'wand');
    
    if (DOM.buyFreezeBtn) {
        DOM.buyFreezeBtn.addEventListener('click', () => {
            if (state.carrots >= 50) {
                state.carrots -= 50;
                state.streakFreezes++;
                saveState();
                renderCarrots();
                renderFreezes();
                showToast("Bought Streak Freeze! ❄️");
                gsap.from(DOM.freezeDisplay, { scale: 1.5, duration: 0.3, ease: "back.out(2)" });
            } else {
                gsap.to(DOM.buyFreezeBtn, { x: 5, duration: 0.1, yoyo: true, repeat: 3 });
                showToast("Not enough 🥕!");
            }
        });
    }
    
    // Shop btn from top bar
    if (DOM.shopBtn) {
        DOM.shopBtn.addEventListener('click', () => {
            const shopNavBtn = document.querySelector('.nav-btn[data-tab="shop"]');
            if (shopNavBtn) shopNavBtn.click();
        });
    }

    // Bunny interactions
    if (DOM.bunnyCanvas) {
        DOM.bunnyCanvas.addEventListener('click', animateThreeClick);
    }
    
    if (DOM.continueBtn) {
        DOM.continueBtn.addEventListener('click', hideBunnyPopup);
    }

    if (DOM.historyCloseBtn) {
        DOM.historyCloseBtn.addEventListener('click', () => {
            gsap.to(DOM.historyModal.querySelector('.modal-content'), { scale: 0.8, duration: 0.2 });
            gsap.to(DOM.historyModal, { autoAlpha: 0, duration: 0.2, delay: 0.1, onComplete: () => {
                gsap.set(DOM.historyModal, { display: 'none' });
            }});
        });
    }
    
    if (DOM.statsBtn) {
        DOM.statsBtn.addEventListener('click', () => {
            renderStatsModal();
            gsap.set(DOM.statsModal, { display: 'flex' });
            gsap.to(DOM.statsModal, { autoAlpha: 1, duration: 0.3 });
            const content = DOM.statsModal.querySelector('.modal-content');
            if (content) {
                gsap.fromTo(content, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: "back.out(1.5)" });
            }
            if (typeof twemoji !== 'undefined') twemoji.parse(DOM.statsModal);
        });
    }
    
    if (DOM.statsCloseBtn) {
        DOM.statsCloseBtn.addEventListener('click', () => {
            gsap.to(DOM.statsModal.querySelector('.modal-content'), { scale: 0.8, duration: 0.2 });
            gsap.to(DOM.statsModal, { autoAlpha: 0, duration: 0.2, delay: 0.1, onComplete: () => {
                gsap.set(DOM.statsModal, { display: 'none' });
            }});
        });
    }
    
    if (DOM.milestoneCloseBtn) {
        DOM.milestoneCloseBtn.addEventListener('click', () => {
            gsap.to(DOM.milestoneModal.querySelector('.modal-content'), { scale: 0.8, duration: 0.2 });
            gsap.to(DOM.milestoneModal, { autoAlpha: 0, duration: 0.2, delay: 0.1, onComplete: () => {
                gsap.set(DOM.milestoneModal, { display: 'none' });
            }});
        });
    }
    
    if (DOM.distractBtns) {
        DOM.distractBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                if (state.distractions[type] !== undefined) {
                    state.distractions[type]++;
                    saveState();
                    showToast(`Logged distraction. Back to work! 🐰`);
                    
                    gsap.to(DOM.distractionModal.querySelector('.modal-content'), { scale: 0.8, duration: 0.2 });
                    gsap.to(DOM.distractionModal, { autoAlpha: 0, duration: 0.2, delay: 0.1, onComplete: () => {
                        gsap.set(DOM.distractionModal, { display: 'none' });
                    }});
                }
            });
        });
    }
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && pomo.isRunning && pomo.mode === 'focus') {
            pomo.hiddenTime = Date.now();
        } else if (!document.hidden && pomo.isRunning && pomo.mode === 'focus' && pomo.hiddenTime) {
            const passed = Math.floor((Date.now() - pomo.hiddenTime) / 1000);
            if (passed > 60) {
                gsap.set(DOM.distractionModal, { display: 'flex' });
                gsap.to(DOM.distractionModal, { autoAlpha: 1, duration: 0.3 });
                const content = DOM.distractionModal.querySelector('.modal-content');
                if (content) {
                    gsap.fromTo(content, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: "back.out(1.5)" });
                }
            }
            pomo.hiddenTime = 0;
        }
    });
}

// 26. updateAllShopButtons()
function updateAllShopButtons() {
    if (DOM.shopCarrotDisplay) DOM.shopCarrotDisplay.textContent = state.carrots;
    
    SHOP_ITEMS.forEach(item => {
        const btnId = `buy-${item.id}-btn`;
        const btn = document.getElementById(btnId);
        if (!btn) return;
        
        btn.classList.remove('equipped');
        
        if (state.equippedItems.includes(item.id)) {
            btn.textContent = 'Unequip';
            btn.classList.add('equipped');
            btn.disabled = false;
        } else if (state.ownedItems.includes(item.id)) {
            btn.textContent = 'Equip';
            btn.disabled = false;
        } else {
            btn.textContent = `Buy (${item.cost} 🥕)`;
            if (state.carrots < item.cost) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    });
}

// 27. CSV Export
function exportCSV() {
    let csv = 'Date,Habit,Completed,Note\n';
    const dates = Object.keys(state.history).sort();
    dates.forEach(date => {
        const day = state.history[date];
        if (day.frozen) {
            csv += `${date},STREAK FREEZE,true,"Day was frozen"\n`;
        } else if (day.habits) {
            day.habits.forEach(h => {
                csv += `${date},"${h.name}",${h.completed},"${h.note || ''}"\n`;
            });
        }
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunny-habits-${state.today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// 28. Browser Notifications
function setupNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
        // Don't auto-request, wait for user to click
    }
    
    if (state.reminderTime) {
        scheduleDailyReminder(state.reminderTime);
    }
}

function scheduleDailyReminder(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();
    
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification('Bunny Habits 🐰', {
                body: 'Hey cutie! Time to check your habits! 💕',
                icon: '🐰' // In a real app this would be an image URL
            });
        }
        scheduleDailyReminder(timeStr);
    }, delay);
}

function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    }
}

// Mood Picker
function setupMoodPicker() {
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.dataset.mood;
            state.todayMood = mood;
            saveState();
            saveTodayToHistory();
            
            // Visual selection
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gsap.from(btn, { scale: 0.7, duration: 0.3, ease: "back.out(2)" });
            
            // Mood-aware bunny message
            if (moodMessages[mood]) {
                const msgs = moodMessages[mood].start;
                setMascotMessage(msgs[Math.floor(Math.random() * msgs.length)]);
                showBunnyPopup();
            }
            
            // Bonus XP toast for rough/sad days
            if (mood === 'sad' || mood === 'rough') {
                addXP(5);
                showToast("Thanks for sharing 💕 +5 XP bonus today!");
            }
            
            if (typeof twemoji !== 'undefined') twemoji.parse(document.body);
        });
    });
}

function renderMoodSelection() {
    if (!state.todayMood) return;
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
        if (btn.dataset.mood === state.todayMood) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// 29. fireConfetti()
function fireConfetti(big = false) {
    if (typeof confetti === 'function') {
        const count = big ? 200 : 100;
        const defaults = { origin: { y: 0.7 } };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }
}

// 30. renderCarrots, renderFreezes, renderStreak
function renderCarrots() {
    if (DOM.carrotCount) {
        DOM.carrotCount.textContent = state.carrots;
    }
}

function renderFreezes() {
    if (DOM.freezeDisplay && DOM.freezeCount) {
        if (state.streakFreezes > 0) {
            DOM.freezeDisplay.style.display = 'inline-block';
            DOM.freezeCount.textContent = state.streakFreezes;
        } else {
            DOM.freezeDisplay.style.display = 'none';
        }
    }
}

function renderStreak() {
    if (DOM.streakCount) {
        DOM.streakCount.textContent = state.streak;
        if (state.streak > 0) {
            gsap.from(DOM.streakCount, {
                scale: 1.5,
                color: "#ffaa00",
                duration: 0.5,
                ease: "back.out(2)"
            });
        }
    }
}

// 32. Call init()
document.addEventListener('DOMContentLoaded', init);
