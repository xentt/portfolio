(function() {
    'use strict';

    // ============================================================
    // CHARACTER DATA
    // ============================================================
    var CHARACTERS = {
        kirito: {
            name: 'Kirito', role: 'Espadachin Negro', theme: 'blue', color: '#00b4ff',
            initial: 'K', location: 'Aincrad', floor: 74, guild: 'N/A',
            weapon: 'Elucidator', armor: 'Coat of Midnight',
            hp: 95, mp: 72, lv: 42,
            desc: 'El protagonista de SAO. Conocido como Beater, un jugador beta tester con habilidades excepcionales con la espada. Domino el arte del Dual Beans y supero todos los desafios de Aincrad para liberar a los 10,000 jugadores atrapados.',
            skills: { 'Espada Alta': 95, 'Velocidad': 90, 'Dual Blades': 98, 'Esquivar': 85, 'Busqueda': 70 }
        },
        asuna: {
            name: 'Asuna', role: 'Titania', theme: 'purple', color: '#7c5cfc',
            initial: 'A', location: 'Aincrad', floor: 74, guild: 'Knights of Blood',
            weapon: 'Lambent Light', armor: 'Vestimenta Carmesi',
            hp: 88, mp: 92, lv: 40,
            desc: 'Vicecomandante de los Knights of Blood. La segunda jugadora mas rapida de SAO. Experta en esgrima y cocina, su velocidad y precision son legendarias en el campo de batalla.',
            skills: { 'Espada Rapida': 97, 'Precision': 92, 'Cocina': 99, 'Esquivar': 88, 'Liderazgo': 85 }
        },
        sinon: {
            name: 'Sinon', role: 'Francotiradora', theme: 'orange', color: '#ff8c00',
            initial: 'S', location: 'GGO', floor: 1, guild: 'N/A',
            weapon: 'Hecate II', armor: 'Chaqueta Tactica',
            hp: 70, mp: 68, lv: 38,
            desc: 'La francotiradora mas temida de Gun Gale Online. Su precision con el Hecate II es legendaria. Aunque parece fria y calculadora, tiene un corazon valiente que la llevo a enfrentar sus miedos.',
            skills: { 'Francotiro': 99, 'Sigilo': 95, 'Percepcion': 90, 'Supervivencia': 85, 'Rastreo': 80 }
        },
        leafa: {
            name: 'Leafa', role: 'Espadachina Sylph', theme: 'green', color: '#4cff91',
            initial: 'L', location: 'ALfheim', floor: 1, guild: 'Sylph',
            weapon: 'Wind Fleuret', armor: 'Vestimenta Verde',
            hp: 82, mp: 88, lv: 36,
            desc: 'Hermana menor de Kirito en el mundo real. Experta espadachina en ALfheim Online con habilidades de magia viento y vuelo. Siempre apoya a su hermano en sus aventuras.',
            skills: { 'Espada Ligera': 93, 'Magia Viento': 90, 'Vuelo': 88, 'Velocidad': 85, 'Sanacion': 72 }
        },
        heathcliff: {
            name: 'Heathcliff', role: 'Comandante', theme: 'gold', color: '#ffc107',
            initial: 'H', location: 'Aincrad', floor: 74, guild: 'Knights of Blood',
            weapon: 'Liberator', armor: 'Armadura Blanca',
            hp: 99, mp: 99, lv: 50,
            desc: 'Comandante de los Knights of Blood. Su verdadera identidad es Kayaba Akihiko, el creador de Sword Art Online. Un jugador aparentemente invencible con estadisticas perfectas.',
            skills: { 'Defensa': 99, 'Espada': 99, 'Liderazgo': 99 }
        }
    };

    var SLIDES = [
        { name: 'kirito', theme: 'blue', color: '#00b4ff' },
        { name: 'asuna', theme: 'purple', color: '#7c5cfc' },
        { name: 'sinon', theme: 'orange', color: '#ff8c00' },
        { name: 'leafa', theme: 'green', color: '#4cff91' },
        { name: 'heathcliff', theme: 'gold', color: '#ffc107' }
    ];

    // ============================================================
    // DOM
    // ============================================================
    var $ = function(s) { return document.querySelector(s); };
    var $$ = function(s) { return document.querySelectorAll(s); };

    var loadingScreen = $('#loadingScreen');
    var loadingBar = $('#loadingBar');
    var loadingMsg = $('#loadingMsg');
    var loadingEnter = $('#loadingEnter');
    var loadingHp = $('#loadingHp');
    var loadingMp = $('#loadingMp');
    var loadingHpVal = $('#loadingHpVal');
    var loadingMpVal = $('#loadingMpVal');
    var loadingFloor = $('#loadingFloor');
    var loadingParticles = $('#loadingParticles');
    var cursor = $('#cursor');
    var cursorDot = $('#cursorDot');
    var header = $('#header');
    var banner = $('#banner');
    var progressFill = $('#progressFill');
    var progressTimer = $('#progressTimer');
    var rainContainer = $('#rainContainer');
    var modal = $('#modal');
    var modalX = $('#modalX');
    var pauseBtn = $('#pauseBtn');
    var scCurrent = $('#scCurrent');
    var brandLogo = $('#brandLogo');

    // ============================================================
    // AUDIO
    // ============================================================
    var actx = null;
    function ensureAudio() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); }
    function beep(freq, dur, type, vol) {
        try {
            ensureAudio();
            var o = actx.createOscillator();
            var g = actx.createGain();
            o.type = type || 'square';
            o.frequency.value = freq || 800;
            g.gain.setValueAtTime(vol || 0.04, actx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + (dur || 0.08));
            o.connect(g); g.connect(actx.destination);
            o.start(); o.stop(actx.currentTime + (dur || 0.08));
        } catch(e) {}
    }
    function sndClick() { beep(600, 0.04, 'square', 0.03); }
    function sndHover() { beep(400, 0.025, 'sine', 0.012); }
    function sndOk() { beep(880, 0.07, 'square', 0.035); setTimeout(function() { beep(1100, 0.09, 'square', 0.035); }, 70); }
    function sndTransition() { beep(523, 0.05, 'sine', 0.02); setTimeout(function() { beep(659, 0.05, 'sine', 0.02); }, 50); }
    document.addEventListener('click', ensureAudio, { once: true });

    // ============================================================
    // LOADING SCREEN
    // ============================================================
    var loadProgress = 0;
    var loadDone = false;
    var msgs = ['Inicializando NERvGear...','Conectando al servidor...','Cargando SAO...','Verificando credenciales...','Cargando mundo (Aincrad)...','Sistema listo.'];

    function createLoadingParticles() {
        for (var i = 0; i < 30; i++) {
            var p = document.createElement('div');
            p.className = 'loading-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = (Math.random() * 4) + 's';
            p.style.animationDuration = (3 + Math.random() * 3) + 's';
            loadingParticles.appendChild(p);
        }
    }
    createLoadingParticles();

    function tickLoad() {
        loadProgress += Math.random() * 6 + 1.5;
        if (loadProgress > 100) loadProgress = 100;
        loadingBar.style.width = loadProgress + '%';

        var hp = Math.min(100, Math.floor(loadProgress * 0.95 + Math.random() * 5));
        var mp = Math.min(80, Math.floor(loadProgress * 0.72 + Math.random() * 4));
        var floor = Math.min(100, Math.floor(loadProgress));
        loadingHp.style.width = hp + '%';
        loadingMp.style.width = (mp / 80 * 100) + '%';
        loadingHpVal.textContent = hp + '/100';
        loadingMpVal.textContent = mp + '/80';
        loadingFloor.textContent = floor;

        var idx = Math.min(Math.floor(loadProgress / 100 * msgs.length), msgs.length - 1);
        loadingMsg.textContent = msgs[idx];

        if (loadProgress >= 100 && !loadDone) {
            loadDone = true;
            loadingMsg.textContent = '';
            loadingEnter.style.display = 'inline-block';
            loadingEnter.focus();
        } else if (loadProgress < 100) {
            setTimeout(tickLoad, 180 + Math.random() * 120);
        }
    }
    tickLoad();

    function enterApp() {
        if (!loadDone) return;
        sndOk();
        loadingScreen.classList.add('fade-out');
        setTimeout(function() {
            loadingScreen.style.display = 'none';
            initApp();
        }, 1000);
    }
    loadingEnter.addEventListener('click', enterApp);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && loadDone && loadingScreen.style.display !== 'none') enterApp();
    });

    // ============================================================
    // CUSTOM CURSOR
    // ============================================================
    var mouseX = 0, mouseY = 0;
    var cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    function attachCursorListeners() {
        $$('.cursor-scale').forEach(function(el) {
            el.removeEventListener('mouseenter', onCursorEnter);
            el.removeEventListener('mouseleave', onCursorLeave);
            el.addEventListener('mouseenter', onCursorEnter);
            el.addEventListener('mouseleave', onCursorLeave);
        });
    }
    function onCursorEnter() { cursor.classList.add('grow'); }
    function onCursorLeave() { cursor.classList.remove('grow'); }
    attachCursorListeners();

    // ============================================================
    // RAIN EFFECT
    // ============================================================
    function createRain() {
        var count = 80;
        for (var i = 0; i < count; i++) {
            var drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDuration = (4 + Math.random() * 4) + 's';
            drop.style.animationDelay = (Math.random() * 5) + 's';
            drop.style.height = (30 + Math.random() * 40) + 'px';
            drop.style.opacity = (0.1 + Math.random() * 0.3);
            rainContainer.appendChild(drop);
        }
    }

    // ============================================================
    // SLIDER
    // ============================================================
    var currentSlide = 0;
    var isTransitioning = false;
    var autoPlayTimer = null;
    var isPaused = false;
    var autoPlayDuration = 10000;
    var progressInterval = null;
    var progressStart = 0;
    var slides = $$('.slide');
    var navDots = $$('.nav-dot');
    var menuItems = $$('.header-menu li');

    function updateSlideCounter() {
        scCurrent.textContent = String(currentSlide + 1).padStart(2, '0');
    }

    function updateProgressTimer() {
        if (isPaused) return;
        var elapsed = Date.now() - progressStart;
        var remaining = Math.max(0, autoPlayDuration - elapsed);
        var seconds = Math.ceil(remaining / 1000);
        progressTimer.textContent = seconds + 's';
    }

    function startProgressAnimation() {
        progressStart = Date.now();
        progressFill.style.transition = 'none';
        progressFill.style.width = '0%';
        setTimeout(function() {
            progressFill.style.transition = 'width ' + autoPlayDuration + 'ms linear';
            progressFill.style.width = '100%';
        }, 50);

        clearInterval(progressInterval);
        progressInterval = setInterval(updateProgressTimer, 100);
    }

    function goToSlide(index) {
        if (isTransitioning || index === currentSlide) return;
        isTransitioning = true;
        sndTransition();

        slides[currentSlide].classList.remove('active');
        navDots[currentSlide].classList.remove('active');
        menuItems[currentSlide].classList.remove('active');

        currentSlide = index;
        slides[currentSlide].classList.add('active');
        navDots[currentSlide].classList.add('active');
        menuItems[currentSlide].classList.add('active');

        header.className = 'header theme-' + SLIDES[currentSlide].theme;
        progressFill.style.background = SLIDES[currentSlide].color;
        updateSlideCounter();

        navDots.forEach(function(dot, i) {
            dot.className = 'nav-dot cursor-scale' + (i === currentSlide ? ' active slide-' + SLIDES[i].theme : '');
        });

        attachCursorListeners();
        startProgressAnimation();

        setTimeout(function() {
            isTransitioning = false;
        }, 800);
    }

    function nextSlide() {
        var next = (currentSlide + 1) % SLIDES.length;
        goToSlide(next);
    }

    function prevSlide() {
        var prev = (currentSlide - 1 + SLIDES.length) % SLIDES.length;
        goToSlide(prev);
    }

    // Nav dot clicks
    navDots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            sndClick();
            var index = parseInt(dot.dataset.index);
            goToSlide(index);
            resetAutoPlay();
        });
    });

    // Menu item clicks
    menuItems.forEach(function(item) {
        item.addEventListener('click', function() {
            sndClick();
            var index = parseInt(item.dataset.slide);
            goToSlide(index);
            resetAutoPlay();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (loadingScreen.style.display !== 'none') return;
        if (modal.classList.contains('open')) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            nextSlide();
            resetAutoPlay();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            prevSlide();
            resetAutoPlay();
        } else if (e.key === ' ') {
            e.preventDefault();
            togglePause();
        }
    });

    // Mouse wheel
    var wheelTimeout = null;
    banner.addEventListener('wheel', function(e) {
        if (wheelTimeout) return;
        wheelTimeout = setTimeout(function() { wheelTimeout = null; }, 1200);
        if (e.deltaY > 0) nextSlide();
        else prevSlide();
        resetAutoPlay();
    });

    // Touch support
    var touchStartX = 0;
    var touchStartY = 0;
    banner.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    banner.addEventListener('touchend', function(e) {
        var diffX = touchStartX - e.changedTouches[0].clientX;
        var diffY = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) nextSlide();
            else prevSlide();
            resetAutoPlay();
        } else if (Math.abs(diffY) > 50) {
            if (diffY > 0) nextSlide();
            else prevSlide();
            resetAutoPlay();
        }
    });

    // Auto play
    function startAutoPlay() {
        clearInterval(autoPlayTimer);
        if (!isPaused) {
            autoPlayTimer = setTimeout(function() {
                nextSlide();
                startAutoPlay();
            }, autoPlayDuration);
            startProgressAnimation();
        }
    }

    function resetAutoPlay() {
        clearTimeout(autoPlayTimer);
        startAutoPlay();
    }

    function togglePause() {
        isPaused = !isPaused;
        var pauseIcon = pauseBtn.querySelector('.pause-icon');
        var playIcon = pauseBtn.querySelector('.play-icon');
        if (isPaused) {
            clearTimeout(autoPlayTimer);
            clearInterval(progressInterval);
            pauseIcon.style.display = 'none';
            playIcon.style.display = 'block';
            progressFill.style.transition = 'none';
        } else {
            pauseIcon.style.display = 'block';
            playIcon.style.display = 'none';
            startAutoPlay();
        }
        sndClick();
    }

    pauseBtn.addEventListener('click', togglePause);

    // Hover to pause
    var infoBoxes = $$('.info-box, .skills-row');
    infoBoxes.forEach(function(box) {
        box.addEventListener('mouseenter', function() {
            if (!isPaused) {
                clearTimeout(autoPlayTimer);
                clearInterval(progressInterval);
                progressFill.style.transition = 'none';
            }
        });
        box.addEventListener('mouseleave', function() {
            if (!isPaused) {
                startAutoPlay();
            }
        });
    });

    // ============================================================
    // PARALLAX
    // ============================================================
    var characterImgs = $$('.character-img');

    banner.addEventListener('mousemove', function(e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 2;
        var y = (e.clientY / window.innerHeight - 0.5) * 2;

        characterImgs.forEach(function(img) {
            var depth = parseFloat(img.dataset.depth) || 0.15;
            var moveX = x * depth * 30;
            var moveY = y * depth * 20;
            img.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
        });
    });

    // ============================================================
    // CHARACTER MODAL
    // ============================================================
    function openModal(charKey) {
        var c = CHARACTERS[charKey];
        if (!c) return;
        sndOk();

        var avatar = $('#modalAvatar');
        avatar.textContent = c.initial;
        avatar.style.background = c.color + '15';
        avatar.style.color = c.color;
        avatar.style.border = '2px solid ' + c.color + '40';

        $('#modalName').textContent = c.name;
        $('#modalName').style.color = c.color;
        $('#modalRole').textContent = c.role;

        var statsHtml = '';
        statsHtml += '<div class="stat-item"><div class="stat-label">HP</div><div class="stat-value" style="color:var(--red)">' + c.hp + '</div></div>';
        statsHtml += '<div class="stat-item"><div class="stat-label">MP</div><div class="stat-value" style="color:var(--blue)">' + c.mp + '</div></div>';
        statsHtml += '<div class="stat-item"><div class="stat-label">LV</div><div class="stat-value" style="color:' + c.color + '">' + c.lv + '</div></div>';
        statsHtml += '<div class="stat-item"><div class="stat-label">FLOOR</div><div class="stat-value" style="color:var(--text)">' + c.floor + '</div></div>';
        $('#modalStats').innerHTML = statsHtml;

        var skillsHtml = '<div class="modal-skills-title">Habilidades</div>';
        var skillKeys = Object.keys(c.skills);
        skillKeys.forEach(function(k) {
            var v = c.skills[k];
            skillsHtml += '<div class="skill-bar"><div class="skill-bar-header"><span class="skill-bar-name">' + k + '</span><span class="skill-bar-val" style="color:' + c.color + '">' + v + '</span></div><div class="skill-bar-track"><div class="skill-bar-fill" style="width:0%;background:' + c.color + '"></div></div></div>';
        });
        $('#modalSkills').innerHTML = skillsHtml;

        $('#modalDesc').textContent = c.desc;

        var weaponRow = '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;"><span style="color:var(--text-3)">Arma</span><span style="color:var(--text);font-weight:500">' + c.weapon + '</span></div>';
        var armorRow = '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;"><span style="color:var(--text-3)">Armadura</span><span style="color:var(--text);font-weight:500">' + c.armor + '</span></div>';
        var guildRow = '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;"><span style="color:var(--text-3)">Guild</span><span style="color:var(--text);font-weight:500">' + c.guild + '</span></div>';
        var locRow = '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;"><span style="color:var(--text-3)">Ubicacion</span><span style="color:var(--text);font-weight:500">' + c.location + '</span></div>';

        $('#modalDesc').insertAdjacentHTML('beforebegin', weaponRow + armorRow + guildRow + locRow);

        modal.classList.add('open');

        setTimeout(function() {
            $$('.skill-bar-fill').forEach(function(fill) {
                var val = fill.parentElement.previousElementSibling.querySelector('.skill-bar-val').textContent;
                fill.style.width = val + '%';
            });
        }, 100);
    }

    function closeModal() {
        modal.classList.remove('open');
        sndClick();
    }

    modalX.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

    // CTA buttons
    $$('.cta-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var charKey = btn.dataset.char;
            openModal(charKey);
        });
    });

    // ============================================================
    // EASTER EGG - Triple click SAO
    // ============================================================
    var brandClicks = 0;
    var brandTimer = null;
    brandLogo.addEventListener('click', function() {
        brandClicks++;
        if (brandTimer) clearTimeout(brandTimer);
        brandTimer = setTimeout(function() { brandClicks = 0; }, 1500);

        brandLogo.classList.add('glitch');
        setTimeout(function() { brandLogo.classList.remove('glitch'); }, 300);

        if (brandClicks >= 3) {
            brandClicks = 0;
            sndOk();
            document.body.style.filter = 'hue-rotate(180deg) invert(1)';
            setTimeout(function() { document.body.style.filter = ''; }, 3000);
        }
    });

    // ============================================================
    // INIT
    // ============================================================
    function initApp() {
        createRain();
        header.className = 'header theme-blue';
        updateSlideCounter();
        startAutoPlay();
    }

})();
