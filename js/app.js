$(document).ready(function () {
    initApp();
});

// ── Login ─────────────────────────────────────────────────────

function doLogin() {
    const email    = $('#loginEmail').val().trim();
    const password = $('#loginPassword').val().trim();

    if (!email) {
        showLoginError('loginEmail', 'Informe seu e-mail ou telefone');
        return;
    }
    if (!password) {
        showLoginError('loginPassword', 'Informe sua senha');
        return;
    }

    const btn = document.querySelector('.login-btn');
    btn.textContent = 'Entrando...';
    btn.disabled = true;

    setTimeout(() => {
        $('#loginScreen').fadeOut(300);
        btn.textContent = 'Entrar';
        btn.disabled = false;
    }, 900);
}

function showLoginError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    input.style.borderColor = 'var(--danger)';
    input.focus();
    showToast(msg, 'danger');
    setTimeout(() => input.style.borderColor = '', 2500);
}

function togglePassword(btn) {
    const input = btn.closest('.login-input-wrap').querySelector('.login-input');
    const icon  = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye-slash-fill';
    } else {
        input.type = 'password';
        icon.className = 'bi bi-eye-fill';
    }
}

function loginWithGoogle() {
    showToast('Login com Google em breve', 'info');
}

function registerWithGoogle() {
    const btn = document.querySelector('#regStep1 .login-social-btn');
    btn.disabled = true;
    btn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" style="width:14px;height:14px;"></span>
        Conectando ao Google...
    `;
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Cadastrar com Google
        `;
        // Pula direto para a etapa 3 (só precisa de CPF e tipo)
        regGoToStep(3);
        showToast('Conta Google conectada! Complete seu perfil.', 'success');
    }, 1400);
}

function showForgotPassword() {
    showModal(`
        <div style="width:36px;height:4px;background:#E2E8F0;border-radius:4px;margin:0 auto 20px;"></div>
        <h5 style="font-weight:700;margin-bottom:8px;">Recuperar senha</h5>
        <p style="color:var(--text-medium);font-size:0.88rem;margin-bottom:16px;">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
        <input type="email" class="form-control mb-3" placeholder="seu@email.com">
        <button class="btn-primary-custom" style="margin:0;" onclick="closeModal();showToast('Link enviado para seu e-mail!','success')">
            Enviar link
        </button>
        <button class="btn btn-link w-100 mt-2 text-muted" onclick="closeModal()">Cancelar</button>
    `);
}

function showRegister() {
    $('#loginScreen').hide();
    regGoToStep(1);
    $('#registerScreen').fadeIn(250);
}

// ── Register Screen ────────────────────────────────────────────

let regCurrentStep = 1;

function regGoToStep(step) {
    regCurrentStep = step;
    $('#regStep1, #regStep2, #regStep3').hide();
    $('#regStep' + step).show();
    $('#regStepLabel').text(step + ' de 3');
    $('#regProgressBar').css('width', (step / 3 * 100) + '%');

    const btn = document.getElementById('regNextBtn');
    if (step === 3) {
        btn.innerHTML = 'Criar conta <i class="bi bi-check-lg ms-1"></i>';
    } else {
        btn.innerHTML = 'Continuar <i class="bi bi-arrow-right ms-1"></i>';
    }

    $('#registerScreen .register-body').scrollTop(0);
}

function closeRegister() {
    $('#registerScreen').fadeOut(250, function () {
        regGoToStep(1);
        // Clear all register fields
        $('#regName, #regEmail, #regPhone, #regBirth, #regPassword, #regPasswordConfirm, #regCpf').val('');
        $('#regTerms').prop('checked', false);
        $('#passwordStrength').hide();
        $('.req-item').removeClass('ok');
        $('.register-type-option').removeClass('selected');
        $('.register-type-option').first().addClass('selected');
    });
    $('#loginScreen').fadeIn(250);
}

function regNext() {
    if (regCurrentStep === 1) {
        if (!regValidateStep1()) return;
        regGoToStep(2);
    } else if (regCurrentStep === 2) {
        if (!regValidateStep2()) return;
        regGoToStep(3);
    } else {
        if (!regValidateStep3()) return;
        regSubmit();
    }
}

function regValidateStep1() {
    const name  = $('#regName').val().trim();
    const email = $('#regEmail').val().trim();
    const phone = $('#regPhone').val().trim();

    if (!name || name.split(' ').length < 2) {
        showLoginError('regName', 'Informe seu nome completo');
        return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showLoginError('regEmail', 'Informe um e-mail válido');
        return false;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
        showLoginError('regPhone', 'Informe um telefone válido');
        return false;
    }
    return true;
}

function regValidateStep2() {
    const pwd     = $('#regPassword').val();
    const confirm = $('#regPasswordConfirm').val();

    if (pwd.length < 8) {
        showLoginError('regPassword', 'A senha precisa ter no mínimo 8 caracteres');
        return false;
    }
    if (!/[A-Z]/.test(pwd)) {
        showLoginError('regPassword', 'A senha precisa ter ao menos uma letra maiúscula');
        return false;
    }
    if (!/[0-9]/.test(pwd)) {
        showLoginError('regPassword', 'A senha precisa ter ao menos um número');
        return false;
    }
    if (pwd !== confirm) {
        showLoginError('regPasswordConfirm', 'As senhas não coincidem');
        return false;
    }
    return true;
}

function regValidateStep3() {
    const cpf = $('#regCpf').val().replace(/\D/g, '');
    if (cpf.length !== 11) {
        showLoginError('regCpf', 'Informe um CPF válido');
        return false;
    }
    if (!$('#regTerms').is(':checked')) {
        showToast('Aceite os Termos de Uso para continuar', 'warning');
        return false;
    }
    return true;
}

function regSubmit() {
    const btn = document.getElementById('regNextBtn');
    btn.textContent = 'Criando conta...';
    btn.disabled = true;

    setTimeout(() => {
        btn.disabled = false;
        $('#registerScreen').fadeOut(300);
        showToast('Conta criada com sucesso! Bem-vindo ao CareLink 🎉', 'success');
    }, 1200);
}

function selectRegType(el, type) {
    $('.register-type-option').removeClass('selected');
    $(el).addClass('selected');
}

// Password strength & requirements live feedback
$(document).on('input', '#regPassword', function () {
    const pwd = $(this).val();
    if (!pwd) {
        $('#passwordStrength').hide();
        $('.req-item').removeClass('ok');
        return;
    }

    $('#passwordStrength').show();

    const hasLen   = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNum   = /[0-9]/.test(pwd);

    $('#req-len').toggleClass('ok', hasLen);
    $('#req-upper').toggleClass('ok', hasUpper);
    $('#req-num').toggleClass('ok', hasNum);

    const score = [hasLen, hasUpper, hasNum, pwd.length >= 12, /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length;
    const levels = [
        { color: '#EF4444', label: 'Muito fraca' },
        { color: '#F97316', label: 'Fraca' },
        { color: '#EAB308', label: 'Razoável' },
        { color: '#22C55E', label: 'Forte' },
        { color: '#10B981', label: 'Muito forte' }
    ];
    const lvl = levels[Math.min(score, 4)];
    $('#strengthFill').css({ width: (score / 5 * 100) + '%', background: lvl.color });
    $('#strengthLabel').text(lvl.label).css('color', lvl.color);
});

// ── Dependents ────────────────────────────────────────────────

function getDependents() {
    return JSON.parse(localStorage.getItem('carelink_dependents') || '[]');
}

function saveDependents(list) {
    localStorage.setItem('carelink_dependents', JSON.stringify(list));
}

function calcAge(birthStr) {
    if (!birthStr) return null;
    const diff = Date.now() - new Date(birthStr).getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function depInitials(name) {
    return name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function showDependents() {
    closeModal();
    renderDependentsList();
    $('#dependentsScreen').css('display', 'flex');
}

function closeDependents() {
    $('#dependentsScreen').hide();
    $('#depFormOverlay').hide();
}

function renderDependentsList() {
    const deps = getDependents();

    if (deps.length === 0) {
        $('#depEmptyState').show();
        $('#depList').hide();
        $('#depFab').hide();
        return;
    }

    $('#depEmptyState').hide();
    $('#depFab').show();

    const html = deps.map((d, i) => {
        const age = calcAge(d.birth);
        const meta = [d.relation, age ? age + ' anos' : null].filter(Boolean).join(' · ');
        return `
            <div class="dep-card">
                <div class="dep-avatar">${depInitials(d.name)}</div>
                <div class="dep-info">
                    <div class="dep-name">${d.name}</div>
                    <div class="dep-meta">${meta}</div>
                    ${d.notes ? `<div class="dep-meta" style="margin-top:3px;font-style:italic;">${d.notes}</div>` : ''}
                </div>
                <div class="dep-actions">
                    <button class="dep-action-btn" onclick="openDependentForm(${i})" title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="dep-action-btn delete" onclick="deleteDependent(${i})" title="Remover">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </div>`;
    }).join('');

    $('#depList').html(html).show();
}

function openDependentForm(editIndex) {
    // Reset form
    $('#depEditId').val(editIndex !== undefined ? editIndex : '');
    $('#depName').val('');
    $('#depBirth').val('');
    $('#depCpf').val('');
    $('#depNotes').val('');
    $('#depRelation').val('Pai');
    $('.dep-rel-chip').removeClass('selected');
    $('.dep-rel-chip').first().addClass('selected');

    if (editIndex !== undefined) {
        const d = getDependents()[editIndex];
        if (d) {
            $('#depFormTitle').text('Editar dependente');
            $('#depName').val(d.name);
            $('#depBirth').val(d.birth || '');
            $('#depCpf').val(d.cpf || '');
            $('#depNotes').val(d.notes || '');
            $('#depRelation').val(d.relation);
            $('.dep-rel-chip').removeClass('selected');
            $('.dep-rel-chip').filter(function () {
                return $(this).text().trim().includes(d.relation);
            }).addClass('selected');
        }
    } else {
        $('#depFormTitle').text('Novo dependente');
    }

    $('#depFormOverlay').fadeIn(200);
    setTimeout(() => $('#depName').focus(), 300);
}

function closeDependentForm() {
    $('#depFormOverlay').fadeOut(200);
}

function selectRelation(el, value) {
    $('.dep-rel-chip').removeClass('selected');
    $(el).addClass('selected');
    $('#depRelation').val(value);
}

function saveDependent() {
    const name = $('#depName').val().trim();
    if (!name) {
        showLoginError('depName', 'Informe o nome do dependente');
        return;
    }

    const dep = {
        name,
        relation: $('#depRelation').val() || 'Outro',
        birth:    $('#depBirth').val(),
        cpf:      $('#depCpf').val().trim(),
        notes:    $('#depNotes').val().trim()
    };

    const deps = getDependents();
    const editId = $('#depEditId').val();

    if (editId !== '') {
        deps[parseInt(editId)] = dep;
        showToast('Dependente atualizado!', 'success');
    } else {
        deps.push(dep);
        showToast(dep.name + ' adicionado(a)!', 'success');
    }

    saveDependents(deps);
    closeDependentForm();
    renderDependentsList();
    refreshPatientSelect();
}

function deleteDependent(index) {
    const deps = getDependents();
    const name = deps[index]?.name || 'Dependente';
    deps.splice(index, 1);
    saveDependents(deps);
    renderDependentsList();
    refreshPatientSelect();
    showToast(name + ' removido(a)', 'info');
}

function refreshPatientSelect() {
    const deps = getDependents();
    const $sel = $('#patientSelect');
    const current = $sel.val();

    $sel.find('option:not([value="self"])').remove();

    deps.forEach((d, i) => {
        const age = calcAge(d.birth);
        const label = d.name + ' (' + d.relation + (age ? ', ' + age + ' anos' : '') + ')';
        $sel.append(`<option value="dep_${i}">${label}</option>`);
    });

    // Restore selection if still valid
    if ($sel.find(`option[value="${current}"]`).length) {
        $sel.val(current);
    }
}

// CPF mask (register + dependent form)
$(document).on('input', '#regCpf, #depCpf', function () {
    let v = $(this).val().replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    $(this).val(v);
});

// Phone mask
$(document).on('input', '#regPhone', function () {
    let v = $(this).val().replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    $(this).val(v);
});

const appState = {
    currentScreen: 'home',
    selectedServiceType: 'tecnico',
    selectedPeriod: 'data_especifica',
    isRequesting: false,
    requestTimer: null,
    trackingTimers: [],
    currentProfessional: null,
    ratingValue: 0
};

const RATE_MAP = { tecnico: 25, cuidador: 22, enfermeiro: 40, fisio: 50 };

function initApp() {
    initIndexedDB();
    updatePriceEstimate();
    setupEventListeners();
    refreshPatientSelect();
}

function setupEventListeners() {
    $('#serviceDate, #serviceTime, #serviceDuration, #serviceCategory').on('change', updatePriceEstimate);

    $('#serviceCategory').on('change', function () {
        if ($(this).val() === 'pernoite') {
            $('#serviceTime').val('22:00');
            $('#serviceDuration').val('8');
        }
        updatePriceEstimate();
    });

    // Enter no formulário de login
    $('#loginPassword').on('keydown', function (e) {
        if (e.key === 'Enter') doLogin();
    });

    $(document).on('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (appState.isRequesting) cancelRequest();
        else if ($('#modalOverlay').hasClass('active')) closeModal();
        else if (appState.currentScreen !== 'home') navigateTo('home');
    });
}

// ── Navigation ──────────────────────────────────────────────

function navigateTo(screen) {
    const screens = ['homeScreen', 'requestScreen', 'searchingScreen',
        'foundScreen', 'historyScreen', 'ratingScreen'];
    screens.forEach(id => $('#' + id).hide());

    appState.isRequesting = false;
    if (appState.requestTimer) {
        clearTimeout(appState.requestTimer);
        appState.requestTimer = null;
    }

    // Update bottom nav
    $('.nav-item').removeClass('active');
    const navMap = { home: 'navHome', request: 'navRequest', history: 'navHistory', profile: 'navProfile' };
    if (navMap[screen]) $('#' + navMap[screen]).addClass('active');

    switch (screen) {
        case 'request':
            $('#requestScreen').show();
            appState.currentScreen = 'request';
            updatePriceEstimate();
            break;
        case 'history':
            $('#historyScreen').show();
            appState.currentScreen = 'history';
            break;
        case 'profile':
            showProfileModal();
            return;
        default:
            $('#homeScreen').show();
            appState.currentScreen = 'home';
            $('#navHome').addClass('active');
    }

    $('#mainContent').scrollTop(0);
}

function goBack() { navigateTo('home'); }

// ── Service & Period Selection ────────────────────────────────

function selectServiceChip(el, type) {
    $('.service-chip').removeClass('selected');
    $(el).addClass('selected');
    appState.selectedServiceType = type;
    // Sync with form select if open
    updatePriceEstimate();
}

function selectPeriod(el, period) {
    $('.period-option').removeClass('selected');
    $(el).addClass('selected');
    appState.selectedPeriod = period;

    if (period === 'agora') {
        const now = new Date();
        $('#serviceDate').val(now.toISOString().split('T')[0]);
        $('#serviceTime').val(now.toTimeString().slice(0, 5));
        $('#dateTimeFields').slideUp(300);
    } else {
        $('#dateTimeFields').slideDown(300);
    }
}

// ── Price Estimation ──────────────────────────────────────────

function updatePriceEstimate() {
    const category = $('#serviceCategory').val();
    const duration = parseInt($('#serviceDuration').val()) || 4;
    const time = $('#serviceTime').val();

    let rate = RATE_MAP[appState.selectedServiceType] || 25;

    if (time && (time >= '22:00' || time < '06:00')) rate *= 1.3;
    if (category === 'pernoite') {
        rate *= 1.2;
        $('#serviceTime').val('22:00');
    }

    const total = Math.round(rate * duration);
    $('#estimatedPrice').text(total.toFixed(2).replace('.', ','));
}

// ── Request Flow ──────────────────────────────────────────────

function startNewRequest() {
    navigateTo('request');
}

function submitRequest() {
    const category = $('#serviceCategory').val();
    const address = $('#serviceAddress').val().trim();

    if (!category) {
        showToast('Selecione o tipo de serviço', 'warning');
        $('#serviceCategory').focus();
        return;
    }
    if (!address) {
        showToast('Informe o endereço do atendimento', 'warning');
        $('#serviceAddress').focus();
        return;
    }

    saveRequest({
        serviceType: category,
        patient: $('#patientSelect').val(),
        date: $('#serviceDate').val(),
        time: $('#serviceTime').val(),
        duration: $('#serviceDuration').val(),
        address,
        notes: $('#serviceNotes').val(),
        price: $('#estimatedPrice').text()
    });

    // Show searching screen
    $('.nav-item').removeClass('active');
    $('#requestScreen').hide();
    $('#searchingScreen').show();
    appState.currentScreen = 'searching';
    appState.isRequesting = true;
    $('#mainContent').scrollTop(0);

    // Animate notified statuses
    setTimeout(() => animateNotified(), 800);

    // Simulate professional accepting (2–4 s)
    appState.requestTimer = setTimeout(professionalAccepted, 2500 + Math.random() * 1500);
}

function animateNotified() {
    const items = $('.notified-item');
    items.each(function (i) {
        setTimeout(() => {
            $(this).find('.notified-status')
                .removeClass('waiting')
                .text('Notificado')
                .css({ background: '#DBEAFE', color: '#1E40AF' });
        }, i * 400);
    });
}

function professionalAccepted() {
    appState.isRequesting = false;
    const prof = getRandomProfessional();
    appState.currentProfessional = prof;

    // Mark first notified as accepted
    $('.notified-item').first().find('.notified-status')
        .addClass('accepted')
        .text('Aceito ✓')
        .css({ background: '#D1FAE5', color: '#065F46' });

    setTimeout(() => {
        $('#searchingScreen').hide();
        $('#foundScreen').show();
        appState.currentScreen = 'found';
        $('#mainContent').scrollTop(0);

        renderProfessionalCard(prof);
        startEtaCountdown(Math.floor(Math.random() * 15 + 8));
        startTrackingSimulation();

        // Show active service banner on home
        $('#activeProfName').text(prof.name + ' — A caminho');
        $('#activeServiceBanner').show();

        showToast(prof.name + ' aceitou sua solicitação!', 'success');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }, 800);
}

function renderProfessionalCard(prof) {
    $('#trackingProfPin').text(prof.photo);

    $('#acceptedProfessional').html(`
        <div class="professional-header">
            <div class="professional-avatar">${prof.photo}</div>
            <div class="professional-info">
                <div class="professional-name">${prof.name}</div>
                <div class="professional-category">${prof.category}</div>
                <div class="professional-rating">
                    <i class="bi bi-star-fill"></i> ${prof.rating}
                    <span style="color:var(--text-light);font-weight:400;">(${prof.reviews} avaliações)</span>
                </div>
            </div>
        </div>
        <div class="professional-details">
            <div class="detail-chip"><i class="bi bi-geo-alt"></i>${prof.distance}</div>
            <div class="detail-chip"><i class="bi bi-cash"></i>R$${prof.pricePerHour}/h</div>
            <div class="detail-chip"><i class="bi bi-check-circle"></i>Verificado</div>
            ${prof.corEn ? `<div class="detail-chip"><i class="bi bi-shield-check"></i>COREN ${prof.corEn}</div>` : ''}
        </div>
        <div style="font-size:0.78rem;color:var(--text-medium);">
            <strong>Especialidades:</strong> ${prof.specialties.join(' · ')}
        </div>
    `);
}

// ── ETA & Tracking Simulation ─────────────────────────────────

function startEtaCountdown(minutes) {
    let remaining = minutes;
    $('#etaValue').text(remaining);

    const t = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(t);
            $('#etaValue').text('0');
            advanceTrackingStep(2); // "Chegou"
        } else {
            $('#etaValue').text(remaining);
        }
    }, 4000); // speed up for demo (4s = 1 min)

    appState.trackingTimers.push(t);
}

function startTrackingSimulation() {
    // After ~12s mark "Chegou", after ~20s mark "Atendendo"
    const t1 = setTimeout(() => advanceTrackingStep(2), 12000);
    const t2 = setTimeout(() => advanceTrackingStep(3), 20000);
    appState.trackingTimers.push(t1, t2);
}

function advanceTrackingStep(step) {
    for (let i = 1; i <= 4; i++) {
        const el = $('#tStep' + i);
        el.removeClass('done active');
        if (i < step) el.addClass('done');
        else if (i === step) el.addClass('active');
    }

    if (step === 3) {
        $('#activeProfName').text(appState.currentProfessional.name + ' — Chegou');
        showToast(appState.currentProfessional.name + ' chegou ao local!', 'success');
        if (navigator.vibrate) navigator.vibrate([300]);
    }
    if (step === 4) {
        $('#activeProfName').text(appState.currentProfessional.name + ' — Em atendimento');
    }
}

function clearTrackingTimers() {
    appState.trackingTimers.forEach(t => clearTimeout(t));
    appState.trackingTimers = [];
}

// ── Cancel ────────────────────────────────────────────────────

function cancelRequest() {
    if (appState.requestTimer) {
        clearTimeout(appState.requestTimer);
        appState.requestTimer = null;
    }
    appState.isRequesting = false;
    showToast('Solicitação cancelada', 'info');
    navigateTo('home');
}

function cancelAcceptedRequest() {
    showModal(`
        <h5 style="font-weight:700;margin-bottom:12px;">Cancelar atendimento?</h5>
        <p style="color:var(--text-medium);font-size:0.9rem;margin-bottom:20px;">
            Uma taxa de cancelamento pode ser aplicada caso o profissional já esteja a caminho.
        </p>
        <div style="display:flex;gap:10px;">
            <button class="btn btn-outline-secondary flex-grow-1" onclick="closeModal()" style="border-radius:20px;">Manter</button>
            <button class="btn btn-danger flex-grow-1" onclick="confirmCancel()" style="border-radius:20px;">Cancelar</button>
        </div>
    `);
}

function confirmCancel() {
    closeModal();
    clearTrackingTimers();
    appState.currentProfessional = null;
    appState.professionalFound = false;
    $('#activeServiceBanner').hide();
    showToast('Atendimento cancelado', 'warning');
    navigateTo('home');
}

// ── Service Completion & Rating ───────────────────────────────

function completeService() {
    clearTrackingTimers();
    const prof = appState.currentProfessional;
    if (!prof) return;

    $('#activeServiceBanner').hide();

    // Reset rating state
    appState.ratingValue = 0;
    $('.star').removeClass('active');
    $('#ratingHint').text('Toque para avaliar');
    $('#ratingTags').hide();
    $('#ratingComment').val('');
    $('#submitRatingBtn').prop('disabled', true);
    $('.rating-tag').removeClass('selected');

    // Populate rating screen
    $('#ratingProfName').text(prof.name);
    $('#ratingAvatar').text(prof.photo);

    $('#foundScreen').hide();
    $('#ratingScreen').show();
    appState.currentScreen = 'rating';
    $('#mainContent').scrollTop(0);
    $('.nav-item').removeClass('active');
}

function selectRating(value) {
    appState.ratingValue = value;

    $('.star').each(function () {
        $(this).toggleClass('active', parseInt($(this).data('val')) <= value);
    });

    const labels = ['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente!'];
    $('#ratingHint').text(labels[value]);
    $('#ratingTags').show();
    $('#submitRatingBtn').prop('disabled', false);
}

function toggleTag(el) {
    $(el).toggleClass('selected');
}

function submitRating() {
    if (!appState.ratingValue) return;

    const tags = $('.rating-tag.selected').map(function () { return $(this).text(); }).get();
    const comment = $('#ratingComment').val().trim();

    console.log('Rating submitted:', {
        professional: appState.currentProfessional?.name,
        rating: appState.ratingValue,
        tags,
        comment
    });

    showToast('Avaliação enviada! Obrigado pelo feedback.', 'success');
    appState.currentProfessional = null;
    navigateTo('home');
}

function skipRating() {
    appState.currentProfessional = null;
    navigateTo('home');
}

// ── Professional Data ─────────────────────────────────────────

function getRandomProfessional() {
    const data = {
        tecnico: [
            { name: 'Carlos Eduardo', category: 'Técnico de Enfermagem', rating: 4.9, reviews: 238, distance: '1,2 km', pricePerHour: 25, specialties: ['Curativos', 'Medicação', 'Plantão'], corEn: '123456-SP', photo: 'CE' },
            { name: 'Roberto Lima', category: 'Técnico de Enfermagem', rating: 4.7, reviews: 89, distance: '0,8 km', pricePerHour: 25, specialties: ['Home Care', 'Idosos', 'Noturno'], corEn: '23456-SP', photo: 'RL' }
        ],
        cuidador: [
            { name: 'Juliana Costa', category: 'Cuidadora de Idosos', rating: 4.8, reviews: 156, distance: '2,5 km', pricePerHour: 22, specialties: ['Alzheimer', 'Mobilidade', 'Banho'], corEn: null, photo: 'JC' }
        ],
        enfermeiro: [
            { name: 'Dra. Amanda Reis', category: 'Enfermeira', rating: 5.0, reviews: 312, distance: '3,8 km', pricePerHour: 40, specialties: ['UTI', 'Curativos Complexos', 'Pós-cirúrgico'], corEn: '78901-SP', photo: 'AR' }
        ],
        fisio: [
            { name: 'Dr. Lucas Mendes', category: 'Fisioterapeuta', rating: 4.8, reviews: 124, distance: '2,1 km', pricePerHour: 50, specialties: ['Reabilitação', 'Ortopedia', 'Home Care'], corEn: null, photo: 'LM' }
        ]
    };

    const list = data[appState.selectedServiceType] || data.tecnico;
    return list[Math.floor(Math.random() * list.length)];
}

// ── Misc Actions ──────────────────────────────────────────────

function showHistory() { navigateTo('history'); }
function showAllServices() { navigateTo('request'); }
function showProfile() { showProfileModal(); }

function showActiveService() {
    if (appState.currentProfessional) {
        $('#foundScreen').show();
        $('#homeScreen').hide();
        appState.currentScreen = 'found';
    }
}

function changeLocation() {
    showToast('Alterar localização em breve', 'info');
}

function contactProfessional() {
    showToast('Abrindo chat com o profissional...', 'info');
}

function callProfessional() {
    showToast('Iniciando chamada...', 'info');
}

function enableLocation() {
    if (!navigator.geolocation) {
        showToast('Geolocalização não suportada pelo navegador.', 'danger');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (pos) {
            showToast('Localização ativada!', 'success');
            $('#locationAddress').text('Sua posição atual');
            $('#availableCount').text('12 disponíveis');
        },
        function () {
            showToast('Não foi possível obter sua localização.', 'danger');
        }
    );
}

// ── DB user load callback ─────────────────────────────────────

const _origLoadFromDB = loadFromDB;
loadFromDB = function () {
    _origLoadFromDB();
    loadUserData(function (user) {
        const first = user.name.split(' ')[0];
        // Update welcome text if visible
        setTimeout(() => {
            if ($('#homeScreen').is(':visible')) {
                // greeting is static in new design, no element to update
            }
        }, 300);
    });
};

console.log('CareLink App — Cliente v2.0');
