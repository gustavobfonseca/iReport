document.addEventListener('DOMContentLoaded', () => {
    // 1. Interactive Tabs in Certificate Mockup
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Remove active states from buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            // Add active state to clicked button
            btn.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            // Show target content
            const activeContent = document.getElementById(`content-${targetTab}`);
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }
        });
    });

    // 2. Waitlist Form Submission Handling
    const waitlistForm = document.getElementById('waitlist-form');
    const formSuccessMessage = document.getElementById('form-success');

    if (waitlistForm && formSuccessMessage) {
        waitlistForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent standard page reload

            // Extract input values
            const storeName = document.getElementById('store-name').value;
            const ownerName = document.getElementById('owner-name').value;
            const whatsapp = document.getElementById('whatsapp').value;
            const city = document.getElementById('city').value;

            // Log details locally (simulated server registry)
            console.log('--- Novo Registro de Lista de Espera B2B ---');
            console.log('Loja:', storeName);
            console.log('Proprietário:', ownerName);
            console.log('WhatsApp:', whatsapp);
            console.log('Cidade/UF:', city);
            console.log('-------------------------------------------');

            // Save details to localStorage so they persist for demonstration
            const candidate = { storeName, ownerName, whatsapp, city, registeredAt: new Date().toISOString() };
            let candidatesList = JSON.parse(localStorage.getItem('certifica_waitlist') || '[]');
            candidatesList.push(candidate);
            localStorage.setItem('certifica_waitlist', JSON.stringify(candidatesList));

            // Apply transition animation
            waitlistForm.classList.add('hidden');
            formSuccessMessage.classList.remove('hidden');
        });
    }

    // 3. Local Diagnostic Mirroring (Sincronização com o Python)
    if (window.dadosLaudo) {
        const d = window.dadosLaudo;

        // Update certificate ID
        const certIdEl = document.querySelector('.cert-id');
        if (certIdEl) {
            certIdEl.innerText = `LAUDO-ID: #LAUDO_${d.device.imei.slice(-6)}`;
        }

        // Update device info bar
        const infoValues = document.querySelectorAll('.info-value');
        if (infoValues.length >= 3) {
            infoValues[0].innerText = `${d.device.name} (${d.device.type})`;
            infoValues[1].innerText = d.device.mlb_serial;
            infoValues[2].innerText = "Auditoria Local USB";
        }

        // Update certificate status (verified or warning if iCloud is locked)
        const certStatusEl = document.querySelector('.cert-status');
        if (certStatusEl) {
            if (d.device.icloud_locked.includes('BLOQUEADO')) {
                certStatusEl.innerText = 'Status: Alerta';
                certStatusEl.className = 'cert-status error-badge';
            } else {
                certStatusEl.innerText = 'Status: Verificado';
                certStatusEl.className = 'cert-status verified';
            }
        }

        // Update Battery Tab Cards
        const batteryCards = document.querySelectorAll('#content-bateria .status-card');
        if (batteryCards.length >= 3) {
            // Cycle count
            const cycleVal = batteryCards[0].querySelector('.card-main-value');
            if (cycleVal) cycleVal.innerText = `${d.battery.cycles} ciclos`;
            const cycleDesc = batteryCards[0].querySelector('.card-desc');
            if (cycleDesc && d.battery.cycles_status) {
                cycleDesc.innerHTML = `<strong>Status: ${d.battery.cycles_status}</strong><br>Contagem física lida do controlador, imune a resets.`;
            }
            
            // Health %
            const healthVal = batteryCards[1].querySelector('.card-main-value');
            if (healthVal) healthVal.innerText = `${d.battery.health_percentage}%`;
            const healthDesc = batteryCards[1].querySelector('.card-desc');
            if (healthDesc && d.battery.health_status) {
                healthDesc.innerHTML = `<strong>Avaliação: ${d.battery.health_status}</strong><br>Capacidade química real medida em tempo real.`;
            }
            
            // Originality
            const originalVal = batteryCards[2].querySelector('.card-main-value');
            if (originalVal) {
                originalVal.innerText = d.battery.original ? 'Original Apple' : 'Não Original';
                originalVal.className = d.battery.original ? 'card-main-value success-text' : 'card-main-value error-text';
            }
            const originalDesc = batteryCards[2].querySelector('.card-desc');
            if (originalDesc) {
                originalDesc.innerHTML = d.battery.original 
                    ? `<strong>Verificado: Peça Genuína</strong><br>Assinatura confere com os registros de fabricação da placa-mãe.`
                    : `<strong>⚠️ Alerta: Peça Paralela ou Reprogramada</strong><br>O chip desta bateria não possui assinatura original pareada.`;
            }
        }

        // Update Security Tab Cards
        const securityCards = document.querySelectorAll('#content-seguranca .status-card');
        if (securityCards.length >= 2) {
            // iCloud Status Card
            const icloudVal = securityCards[0].querySelector('.card-main-value');
            if (icloudVal) {
                if (d.device.icloud_locked.includes('BLOQUEADO')) {
                    icloudVal.innerText = 'Ativo (Vinculado)';
                    icloudVal.className = 'card-main-value error-text';
                } else {
                    icloudVal.innerText = 'Livre / Desvinculado';
                    icloudVal.className = 'card-main-value success-text';
                }
            }
        }

        console.log('iLaudo.app: Laudo local sincronizado via USB com sucesso!');
    }
});
