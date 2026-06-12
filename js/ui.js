function showModal(content) {
    $('#modalContent').html(content);
    $('#modalOverlay').addClass('active');
}

function closeModal() {
    $('#modalOverlay').removeClass('active');
}

$('#modalOverlay').on('click', function (e) {
    if (e.target === this) closeModal();
});

function showToast(message, type = 'info') {
    const colors = {
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#0891B2'
    };

    const icons = {
        success: 'bi-check-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        danger: 'bi-x-circle-fill',
        info: 'bi-info-circle-fill'
    };

    const toastHTML = `
        <div class="toast align-items-center text-white border-0" role="alert"
             style="background:${colors[type]};min-width:260px;margin-bottom:8px;border-radius:14px;">
            <div class="d-flex align-items-center gap-2">
                <div class="toast-body d-flex align-items-center gap-2" style="font-weight:500;font-size:0.88rem;">
                    <i class="bi ${icons[type]}"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    if ($('.toast-container').length === 0) {
        $('body').append('<div class="toast-container"></div>');
    }

    const $toast = $(toastHTML).appendTo('.toast-container');
    const toast = new bootstrap.Toast($toast[0], { delay: 3500 });
    toast.show();

    $toast.on('hidden.bs.toast', function () { $(this).remove(); });
}

function showNotifications() {
    showModal(`
        <div style="width:36px;height:4px;background:#E2E8F0;border-radius:4px;margin:0 auto 20px;"></div>
        <h5 style="font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i class="bi bi-bell-fill" style="color:var(--primary);"></i>Notificações
        </h5>
        <div style="padding:14px;background:#F0FDF4;border-radius:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;">
            <div style="width:36px;height:36px;background:#10B981;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;">
                <i class="bi bi-check-lg"></i>
            </div>
            <div>
                <p style="font-weight:600;margin:0;font-size:0.88rem;">Atendimento concluído</p>
                <p style="font-size:0.78rem;color:var(--text-medium);margin:2px 0 0;">Carlos Eduardo · 15/05/2026</p>
            </div>
        </div>
        <div style="padding:14px;background:#EFF6FF;border-radius:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;">
            <div style="width:36px;height:36px;background:#3B82F6;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;">
                <i class="bi bi-chat-dots"></i>
            </div>
            <div>
                <p style="font-weight:600;margin:0;font-size:0.88rem;">Nova mensagem</p>
                <p style="font-size:0.78rem;color:var(--text-medium);margin:2px 0 0;">Juliana Costa enviou uma mensagem</p>
            </div>
        </div>
        <div style="padding:14px;background:#FEF3C7;border-radius:14px;margin-bottom:20px;display:flex;gap:12px;align-items:flex-start;">
            <div style="width:36px;height:36px;background:#F59E0B;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;">
                <i class="bi bi-star-fill"></i>
            </div>
            <div>
                <p style="font-weight:600;margin:0;font-size:0.88rem;">Avalie seu atendimento</p>
                <p style="font-size:0.78rem;color:var(--text-medium);margin:2px 0 0;">Roberto Lima · 10/05/2026</p>
            </div>
        </div>
        <button class="btn btn-outline-secondary w-100" onclick="closeModal()" style="border-radius:20px;">Fechar</button>
    `);
}

function showProfileModal() {
    showModal(`
        <div style="width:36px;height:4px;background:#E2E8F0;border-radius:4px;margin:0 auto 20px;"></div>
        <div style="text-align:center;margin-bottom:20px;">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-light));margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:white;font-weight:700;box-shadow:0 4px 16px rgba(8,145,178,0.3);">MO</div>
            <h5 style="font-weight:700;margin:0;">Maria Oliveira</h5>
            <p style="color:var(--text-medium);font-size:0.85rem;margin:4px 0 0;">maria@email.com</p>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#F0FDF4;color:#065F46;font-size:0.78rem;font-weight:600;padding:4px 12px;border-radius:20px;margin-top:8px;">
                <i class="bi bi-star-fill" style="color:#F59E0B;font-size:0.7rem;"></i>4.9 · 8 serviços
            </div>
        </div>
        <div class="list-group list-group-flush" style="border-radius:14px;overflow:hidden;border:1px solid var(--border);">
            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center gap-3" style="padding:14px 16px;">
                <i class="bi bi-person-fill" style="color:var(--primary);font-size:1.1rem;"></i>Meu Perfil
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center gap-3" style="padding:14px 16px;">
                <i class="bi bi-credit-card-fill" style="color:var(--primary);font-size:1.1rem;"></i>Formas de Pagamento
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center gap-3" style="padding:14px 16px;"
               onclick="closeModal();showDependents();">
                <i class="bi bi-people-fill" style="color:var(--primary);font-size:1.1rem;"></i>Dependentes
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center gap-3" style="padding:14px 16px;">
                <i class="bi bi-question-circle-fill" style="color:var(--primary);font-size:1.1rem;"></i>Ajuda & Suporte
            </a>
            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center gap-3 text-danger" style="padding:14px 16px;">
                <i class="bi bi-box-arrow-right" style="font-size:1.1rem;"></i>Sair
            </a>
        </div>
        <button class="btn btn-outline-secondary w-100 mt-3" onclick="closeModal()" style="border-radius:20px;">Fechar</button>
    `);
}
