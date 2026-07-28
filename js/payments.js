// ============================================================
// PAYMENTS - ADMIN CUSTOMER (TO'LIQ TUZATILGAN)
// ============================================================

// ============================================================
// ⭐ TO'LOV USULI MA'LUMOTLARI (TO'LIQ)
// ============================================================
const PAYMENT_METHODS = {
    cash: {
        id: 'cash',
        name: 'Naqd pul',
        icon: 'https://www.gazeta.uz/sp/32221828/img/tild3365-3235-4161-a437-316637323436__banknoti-uzb.png',
        keywords: ['naqd', 'cash', 'pul', 'qog\'oz'],
        emoji: '💵'
    },
    click: {
        id: 'click',
        name: 'Click',
        icon: 'https://api.logobank.uz/media/logos_preview/Click-01_0xvqWH8.png',
        keywords: ['click'],
        emoji: '📱'
    },
    paynet: {
        id: 'paynet',
        name: 'Paynet',
        icon: 'https://frankfurt.apollo.olxcdn.com/v1/files/qum4yr71mite1-UZ/image',
        keywords: ['paynet'],
        emoji: '💳'
    },
    payme: {
        id: 'payme',
        name: 'Payme',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Paymeuz_logo.png',
        keywords: ['payme'],
        emoji: '📲'
    },
    uzum: {
        id: 'uzum',
        name: 'Uzum',
        icon: 'https://admin.uzum.com/wp-content/uploads/2024/09/og-image.jpg',
        keywords: ['uzum', 'uzum bank'],
        emoji: '🟣'
    },
    uzcard: {
        id: 'uzcard',
        name: 'Uzcard',
        icon: 'https://bank.uz/upload/yp/static/058/0584015c28a78f817d6385b99ed3680a.jpg',
        keywords: ['uzcard', 'uz card'],
        emoji: '💳'
    },
    humo: {
        id: 'humo',
        name: 'Humo',
        icon: 'https://payform.global/img/humo.png',
        keywords: ['humo'],
        emoji: '🟠'
    },
    visa: {
        id: 'visa',
        name: 'Visa',
        icon: 'https://i.pinimg.com/originals/1f/50/0c/1f500cb49b3c529f6a88b9a0fa6070e4.jpg?nii=t',
        keywords: ['visa'],
        emoji: '💳'
    },
    agrobank: {
        id: 'agrobank',
        name: 'Agrobank',
        icon: 'https://cdn.forbes.ru/forbes-static/new/2023/03/AgroBank-mini-6414643a35289.jpg',
        keywords: ['agrobank', 'agro bank'],
        emoji: '🌾'
    },
    tbc: {
        id: 'tbc',
        name: 'TBC Bank',
        icon: 'https://yt3.googleusercontent.com/ytc/AIdro_k6EoLZ1l7Xp-B7UADAullK6FNC9C0HE_74uOF2a46H3V4=s900-c-k-c0x00ffffff-no-rj',
        keywords: ['tbc', 'tbcbank'],
        emoji: '🔷'
    },
    anorbank: {
        id: 'anorbank',
        name: 'Anorbank',
        icon: 'https://cbu.uz/upload/iblock/53c/3.jpg',
        keywords: ['anorbank', 'anor bank', 'anor'],
        emoji: '🍊'
    },
    xazna: {
        id: 'xazna',
        name: 'Xazna Bank',
        icon: 'https://jet-back.bank.uz/uploads/article_blocks/d88f203848c154c40be0e793c10fb9a5.webp',
        keywords: ['xazna', 'xasna', 'xazna bank', 'g\'azna', 'gazna'],
        emoji: '🏦'
    },
    anjir: {
        id: 'anjir',
        name: 'Anjir Pay',
        icon: 'https://yt3.googleusercontent.com/CY0fy5wKvwqDsmlRnUkV6xFQzGJQbxbhxMCIPMehKgBgawYm4KNlgt6dp8avty7TQpb8Y8h1=s900-c-k-c0x00ffffff-no-rj',
        keywords: ['anjir', 'anjir pay', 'anjir bank'],
        emoji: '🍐'
    },
    hamkorbank: {
        id: 'hamkorbank',
        name: 'Hamkor Bank',
        icon: 'https://img.hhcdn.ru/employer-logo-original-round/6939937.png',
        keywords: ['hamkor', 'hamkorbank', 'hamkor bank'],
        emoji: '🏛️'
    },
    xalqbanki: {
        id: 'xalqbanki',
        name: 'Xalq Banki',
        icon: 'https://api.onmap.uz/storage/01HYXMSPSC7T0458S4YZV2XJRK.svg',
        keywords: ['xalq', 'xalqbanki', 'xalq banki', 'xalq bank'],
        emoji: '🏛️'
    },
    paypal: {
        id: 'paypal',
        name: 'PayPal',
        icon: 'https://smartpress.by/upload/iblock/85f/dn546q6c891cflormfosv72ixoo1l4gv/paypal.jpg',
        keywords: ['paypal', 'pay pal'],
        emoji: '💳'
    },
    mastercard: {
        id: 'mastercard',
        name: 'MasterCard',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/960px-MasterCard_Logo.svg.png',
        keywords: ['mastercard', 'master card', 'master'],
        emoji: '💳'
    },
    americanexpress: {
        id: 'americanexpress',
        name: 'American Express',
        icon: 'https://live.staticflickr.com/65535/48649342553_8e0daf6313_b.jpg',
        keywords: ['american', 'americanexpress', 'american express', 'amex'],
        emoji: '💳'
    },
    tezpay: {
        id: 'tezpay',
        name: 'TezPay',
        icon: 'https://static.rustore.ru/imgproxy/c9GvEWTzaNNgKCBIj39zh7MM3hJXu-lExCr0HfkejUc/preset:vk_og_img/plain/https://static.rustore.ru/apk/2063541467/content/ICON/39061c50-35b1-484f-a7b2-4329fa0b9c77.png@webp',
        keywords: ['tezpay', 'tez pay'],
        emoji: '⚡'
    },
    applepay: {
        id: 'applepay',
        name: 'Apple Pay',
        icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968230.png',
        keywords: ['apple pay', 'applepay', 'apple'],
        emoji: '🍎'
    },
    other: {
        id: 'other',
        name: 'Boshqa',
        icon: 'https://png.pngtree.com/png-clipart/20211017/original/pngtree-credit-card-vector-illustration-png-image_6857353.png',
        keywords: ['karta', 'card', 'bank', 'to\'lov'],
        emoji: '💳'
    }
};

// ============================================================
// ⭐ TO'LOV USULINI MATN ORQALI AVTOMATIK ANIQLASH
// ============================================================
function detectPaymentMethod(text) {
    if (!text) return PAYMENT_METHODS.other;
    const lowerText = text.toLowerCase().trim();
    
    if (lowerText.includes('uzum')) {
        return PAYMENT_METHODS.uzum;
    }
    if (lowerText.includes('tezpay') || lowerText.includes('tez pay')) {
        return PAYMENT_METHODS.tezpay;
    }
    if (lowerText.includes('apple pay') || lowerText.includes('applepay') || lowerText.includes('apple')) {
        return PAYMENT_METHODS.applepay;
    }
    if (lowerText.includes('hamkor') || lowerText.includes('hamkorbank')) {
        return PAYMENT_METHODS.hamkorbank;
    }
    if (lowerText.includes('xalq')) {
        return PAYMENT_METHODS.xalqbanki;
    }
    if (lowerText.includes('paypal') || lowerText.includes('pay pal')) {
        return PAYMENT_METHODS.paypal;
    }
    if (lowerText.includes('mastercard') || lowerText.includes('master card') || lowerText.includes('master')) {
        return PAYMENT_METHODS.mastercard;
    }
    if (lowerText.includes('american') || lowerText.includes('americanexpress') || lowerText.includes('amex')) {
        return PAYMENT_METHODS.americanexpress;
    }
    if (lowerText.includes('click')) {
        return PAYMENT_METHODS.click;
    }
    if (lowerText.includes('uzcard') || lowerText.includes('uz card')) {
        return PAYMENT_METHODS.uzcard;
    }
    if (lowerText.includes('xazna') || lowerText.includes('g\'azna') || lowerText.includes('gazna')) {
        return PAYMENT_METHODS.xazna;
    }
    if (lowerText.includes('pay') && !lowerText.includes('paypal') && !lowerText.includes('payme') && !lowerText.includes('paynet')) {
        return PAYMENT_METHODS.applepay;
    }
    
    for (const [key, method] of Object.entries(PAYMENT_METHODS)) {
        if (key === 'other') continue;
        if (method.keywords && method.keywords.some(kw => lowerText.includes(kw))) {
            return method;
        }
    }
    return PAYMENT_METHODS.other;
}

// ============================================================
// ⭐ PULNI FORMATLASH
// ============================================================
function formatMoney(amount) {
    if (!amount && amount !== 0) return '0 so\'m';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0 so\'m';
    return num.toLocaleString('uz-UZ') + ' so\'m';
}

// ============================================================
// ⭐ VAQTNI FORMATLASH (TOSHKENT VAQTI BILAN)
// ============================================================
function formatDateTimeFull(date) {
    if (!date) return 'Noma\'lum vaqt';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Noma\'lum vaqt';
        return d.toLocaleString('uz-UZ', {
            timeZone: 'Asia/Tashkent',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (error) {
        return 'Noma\'lum vaqt';
    }
}

let paymentsData = [];
let studentsData = [];
let teachersData = [];
let paymentTypeFilterValue = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) { window.location.href = 'index.html'; return; }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
    }

    await loadData();
    setupListeners();
});

async function loadData() {
    try {
        const [teachersRes, studentsRes, paymentsRes] = await Promise.all([
            API.getTeachers(),
            API.getStudents(),
            API.getPayments()
        ]);

        if (teachersRes.success) teachersData = teachersRes.data || [];
        if (studentsRes.success) studentsData = studentsRes.data || [];
        if (paymentsRes.success) {
            paymentsData = paymentsRes.data || [];
            renderPayments(paymentsData);
        } else {
            renderPayments([]);
        }
    } catch (error) {
        console.error('❌ Ma\'lumotlarni yuklash xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// ⭐ TO'LOVLARNI RENDER QILISH (RASM BILAN)
// ============================================================
function renderPayments(payments) {
    const studentBody = document.getElementById('studentPaymentsBody');
    const teacherBody = document.getElementById('teacherPaymentsBody');
    const studentFeeExpected = document.getElementById('studentFeeExpected');
    const studentFeePaid = document.getElementById('studentFeePaid');
    const studentFeePending = document.getElementById('studentFeePending');
    const studentFeeStatus = document.getElementById('studentFeeStatus');
    const teacherSalaryExpected = document.getElementById('teacherSalaryExpected');
    const teacherSalaryPaid = document.getElementById('teacherSalaryPaid');
    const teacherSalaryPending = document.getElementById('teacherSalaryPending');
    const teacherSalaryStatus = document.getElementById('teacherSalaryStatus');

    const studentPayments = (payments || []).filter(p => p.paymentType !== 'teacher_salary');
    const teacherPayments = (payments || []).filter(p => p.paymentType === 'teacher_salary');

    const renderRows = (rows, type) => {
        if (!rows.length) {
            const cols = type === 'student' ? 7 : 6;
            return `<tr><td colspan="${cols}" class="text-center text-muted">Ma'lumot yo'q</td></tr>`;
        }

        return rows.map(payment => {
            const methodInfo = PAYMENT_METHODS[payment.paymentMethod] || PAYMENT_METHODS.cash;
            const methodDisplay = methodInfo ? `
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.6rem; color: var(--text-muted);">
                    <img src="${methodInfo.icon}" style="width: 16px; height: 16px; object-fit: contain; border-radius: 2px;" onerror="this.style.display='none'">
                    ${methodInfo.name}
                </span>
            ` : '';
            
            const studentName = payment.studentName || 'Noma\'lum';
            const teacherName = payment.teacherName || 'Noma\'lum';
            const amount = payment.amount || 0;
            const month = payment.month || '-';
            const status = payment.status || 'unpaid';
            const createdAt = payment.createdAt ? formatDateTimeFull(payment.createdAt) : '-';
            
            if (type === 'teacher') {
                return `
                    <tr>
                        <td><strong>${teacherName}</strong></td>
                        <td>${formatMoney(amount)}</td>
                        <td>${month}</td>
                        <td><span class="payment-status ${Utils.getStatusClass(status)}">${Utils.formatStatus(status)}</span></td>
                        <td>${methodDisplay}</td>
                        <td style="font-size:0.7rem;color:var(--text-muted);">${createdAt}</td>
                        <td>
                            <div class="actions-container">
                                <button class="btn-secondary" onclick="editPayment('${payment._id}')" title="Tahrirlash">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-danger" onclick="deletePayment('${payment._id}')" title="O'chirish">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
            
            return `
                <tr>
                    <td><strong>${studentName}</strong></td>
                    <td>${teacherName}</td>
                    <td>${formatMoney(amount)}</td>
                    <td>${month}</td>
                    <td><span class="payment-status ${Utils.getStatusClass(status)}">${Utils.formatStatus(status)}</span></td>
                    <td>${methodDisplay}</td>
                    <td style="font-size:0.7rem;color:var(--text-muted);">${createdAt}</td>
                    <td>
                        <div class="actions-container">
                            <button class="btn-secondary" onclick="editPayment('${payment._id}')" title="Tahrirlash">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-danger" onclick="deletePayment('${payment._id}')" title="O'chirish">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    if (studentBody) studentBody.innerHTML = renderRows(studentPayments, 'student');
    if (teacherBody) teacherBody.innerHTML = renderRows(teacherPayments, 'teacher');

    const studentPaid = studentPayments.filter(item => item.status === 'paid').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const studentExpected = studentPayments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const studentPending = studentPayments.filter(item => item.status !== 'paid').length;
    const teacherPaid = teacherPayments.filter(item => item.status === 'paid').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const teacherExpected = teacherPayments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const teacherPending = teacherPayments.filter(item => item.status !== 'paid').length;

    if (studentFeeExpected) studentFeeExpected.textContent = formatMoney(studentExpected);
    if (studentFeePaid) studentFeePaid.textContent = formatMoney(studentPaid);
    if (studentFeePending) studentFeePending.textContent = `${studentPending} ta qolgan`;
    if (studentFeeStatus) studentFeeStatus.textContent = studentPayments.length ? `${studentPayments.length} ta yozuv` : 'Ma\'lumot yo\'q';
    if (teacherSalaryExpected) teacherSalaryExpected.textContent = formatMoney(teacherExpected);
    if (teacherSalaryPaid) teacherSalaryPaid.textContent = formatMoney(teacherPaid);
    if (teacherSalaryPending) teacherSalaryPending.textContent = `${teacherPending} ta qolgan`;
    if (teacherSalaryStatus) teacherSalaryStatus.textContent = teacherPayments.length ? `${teacherPayments.length} ta yozuv` : 'Ma\'lumot yo\'q';

    I18N.updateUI();
}

// ============================================================
// ⭐ TO'LOV QO'SHISH MODAL (ADMIN-CUSTOMER)
// ============================================================
function showAddPaymentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:560px;">
            <div class="modal-header">
                <h3><i class="fas fa-money-bill"></i> To'lov qo'shish</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="addPaymentForm">
                <div class="form-group">
                    <label>To'lov turi</label>
                    <div class="input-wrapper">
                        <select id="paymentType" required>
                            <option value="student_fee">O'quvchi to'lovi</option>
                            <option value="teacher_salary">O'qituvchi maoshi</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" id="studentPaymentGroup">
                    <label>O'quvchi</label>
                    <div class="input-wrapper">
                        <select id="paymentStudent">
                            <option value="">O'quvchi tanlang...</option>
                            ${studentsData.map(s => `<option value="${s._id}">${s.fullName}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>O'qituvchi</label>
                    <div class="input-wrapper">
                        <select id="paymentTeacher" required>
                            <option value="">O'qituvchi tanlang...</option>
                            ${teachersData.map(t => `<option value="${t._id}">${t.fullName}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Summa (so'm)</label>
                    <div class="input-wrapper">
                        <input type="number" id="paymentAmount" placeholder="0" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>Oy</label>
                    <div class="input-wrapper">
                        <input type="month" id="paymentMonth" required />
                    </div>
                </div>
                
                <!-- ⭐ TO'LOV USULI SELECT -->
                <div class="form-group">
                    <label>To'lov usuli</label>
                    <div class="input-wrapper">
                        <select id="paymentMethodSelect" required>
                            <option value="">To'lov usulini tanlang...</option>
                            <option value="cash">💵 Naqd pul</option>
                            <option value="click">📱 Click</option>
                            <option value="paynet">💳 Paynet</option>
                            <option value="payme">📲 Payme</option>
                            <option value="uzum">🟣 Uzum</option>
                            <option value="uzcard">💳 Uzcard</option>
                            <option value="humo">🟠 Humo</option>
                            <option value="visa">💳 Visa</option>
                            <option value="agrobank">🌾 Agrobank</option>
                            <option value="tbc">🔷 TBC Bank</option>
                            <option value="anorbank">🍊 Anorbank</option>
                            <option value="xazna">🏦 Xazna</option>
                            <option value="anjir">🍐 Anjir Pay</option>
                            <option value="hamkorbank">🏛️ Hamkor Bank</option>
                            <option value="xalqbanki">🏛️ Xalq Banki</option>
                            <option value="paypal">💳 PayPal</option>
                            <option value="mastercard">💳 MasterCard</option>
                            <option value="americanexpress">💳 American Express</option>
                            <option value="tezpay">⚡ TezPay</option>
                            <option value="applepay">🍎 Apple Pay</option>
                            <option value="other">💳 Boshqa</option>
                        </select>
                    </div>
                    <div id="paymentMethodPreview" style="display: none; margin-top: 8px;"></div>
                </div>

                <div class="form-group">
                    <label>Holati</label>
                    <div class="input-wrapper">
                        <select id="paymentStatus">
                            <option value="paid">To'langan</option>
                            <option value="pending">Kutilmoqda</option>
                            <option value="unpaid">To'lanmagan</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Izoh (ixtiyoriy)</label>
                    <div class="input-wrapper">
                        <input type="text" id="paymentNote" placeholder="To'lov haqida izoh..." />
                    </div>
                    <small class="text-muted">💡 Izohga to'lov usulini yozsangiz, avtomatik aniqlanadi</small>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()" style="width:auto;padding:8px 20px;font-size:0.8rem;">Bekor qilish</button>
                    <button type="submit" class="btn-primary" style="width:auto;padding:8px 20px;font-size:0.8rem;"><i class="fas fa-save"></i> Saqlash</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    I18N.updateUI();

    // ⭐ TO'LOV USULI SELECT - RASM PREVIEW
    initPaymentMethodSelect();

    // ⭐ Izoh orqali avtomatik aniqlash
    const noteInput = document.getElementById('paymentNote');
    if (noteInput) {
        noteInput.addEventListener('input', function() {
            const text = this.value;
            const detected = detectPaymentMethod(text);
            if (detected && detected.id !== 'other') {
                const selectEl = document.getElementById('paymentMethodSelect');
                if (selectEl) {
                    selectEl.value = detected.id;
                    selectEl.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    const togglePaymentType = () => {
        const paymentType = document.getElementById('paymentType');
        const studentGroup = document.getElementById('studentPaymentGroup');
        if (studentGroup) {
            studentGroup.style.display = paymentType.value === 'student_fee' ? 'block' : 'none';
        }
    };
    document.getElementById('paymentType').addEventListener('change', togglePaymentType);
    togglePaymentType();

    document.getElementById('addPaymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const paymentType = document.getElementById('paymentType').value;
        const studentId = paymentType === 'student_fee' ? document.getElementById('paymentStudent').value : '';
        const teacherId = document.getElementById('paymentTeacher').value;
        const amount = parseInt(document.getElementById('paymentAmount').value) || 0;
        const month = document.getElementById('paymentMonth').value;
        const status = document.getElementById('paymentStatus').value;
        const paymentMethodSelect = document.getElementById('paymentMethodSelect');
        let paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : '';
        const note = document.getElementById('paymentNote').value.trim();

        if (!paymentMethod || paymentMethod === 'other' || paymentMethod === '') {
            const detected = detectPaymentMethod(note);
            paymentMethod = detected.id;
        }

        if (!teacherId || !amount || !month) {
            showError('Barcha maydonlarni to'ldiring!');
            return;
        }
        if (paymentType === 'student_fee' && !studentId) {
            showError('O\'quvchi tanlanishi kerak');
            return;
        }
        if (!paymentMethod || paymentMethod === '') {
            showError('Iltimos, to\'lov usulini tanlang yoki izohda yozing!');
            if (paymentMethodSelect) paymentMethodSelect.focus();
            return;
        }

        try {
            const data = await API.createPayment({
                studentId, teacherId, amount, month, status, paymentType, paymentMethod
            });
            if (data.success) {
                const methodName = PAYMENT_METHODS[paymentMethod]?.name || paymentMethod;
                document.querySelector('.modal').remove();
                showSuccess(`✅ To'lov qo'shildi!\n💳 To'lov usuli: ${methodName}`);
                await loadData();
            } else {
                showError(data.message || 'Xatolik yuz berdi!');
            }
        } catch (error) {
            console.error('❌ To\'lov yaratish xatosi:', error);
            showError('Tarmoq xatosi!');
        }
    });
}

// ============================================================
// ⭐ TO'LOV USULI SELECT VA RASM PREVIEW (ADMIN-CUSTOMER)
// ============================================================
function initPaymentMethodSelect() {
    const select = document.getElementById('paymentMethodSelect');
    const previewDiv = document.getElementById('paymentMethodPreview');
    if (!select || !previewDiv) return;
    
    const newSelect = select.cloneNode(true);
    select.parentNode.replaceChild(newSelect, select);
    
    newSelect.addEventListener('change', function() {
        const methodId = this.value;
        const method = PAYMENT_METHODS[methodId];
        if (method && methodId !== '') {
            previewDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg-hover);border-radius:8px;border:1px solid var(--border-color);margin-top:8px;">
                    <img src="${method.icon}" style="width:40px;height:40px;object-fit:contain;border-radius:6px;background:white;padding:4px;" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="font-size:0.9rem;font-weight:600;display:none;" class="fallback-text">${method.name}</div>
                    <div>
                        <div style="font-weight:600;font-size:0.9rem;">${method.name}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">To'lov usuli tanlandi</div>
                    </div>
                    <span style="margin-left:auto;color:var(--color-success);"><i class="fas fa-check-circle"></i></span>
                </div>
            `;
            previewDiv.style.display = 'block';
        } else {
            previewDiv.innerHTML = '';
            previewDiv.style.display = 'none';
        }
    });
}

// ============================================================
// TO'LOV TAHRIRLASH (ADMIN-CUSTOMER)
// ============================================================
async function editPayment(id) {
    const payment = paymentsData.find(p => p._id === id);
    if (!payment) {
        showError('To\'lov topilmadi!');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Tahrirlash</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="editPaymentForm">
                <div class="form-group">
                    <label>Holati</label>
                    <div class="input-wrapper">
                        <select id="editPaymentStatus">
                            <option value="paid" ${payment.status === 'paid' ? 'selected' : ''}>To'langan</option>
                            <option value="pending" ${payment.status === 'pending' ? 'selected' : ''}>Kutilmoqda</option>
                            <option value="unpaid" ${payment.status === 'unpaid' ? 'selected' : ''}>To'lanmagan</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()" style="width:auto;padding:8px 20px;">Bekor qilish</button>
                    <button type="submit" class="btn-primary" style="width:auto;padding:8px 20px;"><i class="fas fa-save"></i> Saqlash</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    I18N.updateUI();

    document.getElementById('editPaymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('editPaymentStatus').value;

        try {
            const data = await API.updatePayment(id, { status });
            if (data.success) {
                document.querySelector('.modal').remove();
                showSuccess('To\'lov holati yangilandi!');
                await loadData();
            } else {
                showError(data.message || 'Xatolik yuz berdi!');
            }
        } catch (error) {
            console.error('❌ To\'lov yangilash xatosi:', error);
            showError('Tarmoq xatosi!');
        }
    });
}

// ============================================================
// TO'LOV O'CHIRISH (ADMIN-CUSTOMER)
// ============================================================
async function deletePayment(id) {
    if (!confirm('Haqiqatan ham bu to\'lovni o\'chirmoqchimisiz?')) return;
    try {
        const data = await API.deletePayment(id);
        if (data.success) {
            showSuccess('To\'lov o\'chirildi!');
            await loadData();
        } else {
            showError(data.message || 'Xatolik yuz berdi!');
        }
    } catch (error) {
        console.error('❌ To\'lov o\'chirish xatosi:', error);
        showError('Tarmoq xatosi!');
    }
}

// ============================================================
// FILTER (ADMIN-CUSTOMER)
// ============================================================
function filterPayments() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    let filtered = paymentsData;
    if (search) filtered = filtered.filter(p => p.studentName?.toLowerCase().includes(search) || p.teacherName?.toLowerCase().includes(search));
    if (status !== 'all') filtered = filtered.filter(p => p.status === status);
    if (paymentTypeFilterValue === 'student_fee') filtered = filtered.filter(p => p.paymentType !== 'teacher_salary');
    if (paymentTypeFilterValue === 'teacher_salary') filtered = filtered.filter(p => p.paymentType === 'teacher_salary');
    renderPayments(filtered);
}

// ============================================================
// EVENT LISTENERLAR (ADMIN-CUSTOMER)
// ============================================================
function setupListeners() {
    document.getElementById('searchInput').addEventListener('input', filterPayments);
    document.getElementById('statusFilter').addEventListener('change', filterPayments);
    document.getElementById('paymentTypeFilter').addEventListener('change', (e) => {
        paymentTypeFilterValue = e.target.value;
        filterPayments();
    });
    
    const addBtn = document.getElementById('addPaymentBtn');
    if (addBtn) {
        const newBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newBtn, addBtn);
        newBtn.addEventListener('click', showAddPaymentModal);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener('click', () => Auth.logout());
    }
}

function showError(msg) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;color:#dc2626;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;`;
    div.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${msg}</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#dc2626;cursor:pointer;font-size:1.1rem;">×</button>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

function showSuccess(msg) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;color:#065f46;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;`;
    div.innerHTML = `<i class="fas fa-check-circle"></i><span>${msg}</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#065f46;cursor:pointer;font-size:1.1rem;">×</button>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

console.log('✅ payments.js yuklandi (Admin-Customer)');
