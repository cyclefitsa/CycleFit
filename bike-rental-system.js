const SUPABASE_URL = 'https://weuzlifquyzyjyvguvif.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_vEkF99aOD3eu0mq3C-r-Lg_D5h9qDOe'; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    
    const mainContent = document.getElementById('main-content');
    const loginScreen = document.getElementById('login-screen');
    const bikesScreen = document.getElementById('bikes-screen');
    const bikesList = document.getElementById('bikes-list');
    
    const startBtn = document.getElementById('start-journey-btn');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyBtn = document.getElementById('verify-btn');

    // 1. الانتقال لشاشة الدخول
    startBtn.addEventListener('click', () => {
        mainContent.style.display = 'none';
        loginScreen.style.display = 'block';
    });

    // 2. الانتقال لشاشة الرمز
    sendOtpBtn.addEventListener('click', () => {
        if (document.getElementById('full-name').value) {
            document.getElementById('phone-section').style.display = 'none';
            document.getElementById('otp-section').style.display = 'block';
        }
    });

    // 3. التحقق وعرض الدراجات من Supabase
    verifyBtn.addEventListener('click', async () => {
        const code = document.getElementById('otp-input').value;
        if (code === "1234") {
            loginScreen.style.display = 'none';
            bikesScreen.style.display = 'block';
            
            // جلب البيانات وعرضها
            const { data: bikes, error } = await supabaseClient.from('bikes').select('*');
            
            if (bikes) {
                bikesList.innerHTML = ''; // تفريغ رسالة التحميل
                bikes.forEach(bike => {
                    const card = document.createElement('div');
                    card.className = 'bike-card';
                    card.innerHTML = `
                        <div class="bike-info">
                            <h3>دراجة ${bike.bike_name}</h3>
                            <p>الحالة: ${bike.status === 'available' ? '✅ متاحة' : '❌ محجوزة'}</p>
                        </div>
                        <button class="rent-btn" ${bike.status !== 'available' ? 'disabled style="opacity:0.5"' : ''}>
                            ${bike.status === 'available' ? 'احجز' : 'غير متاحة'}
                        </button>
                    `;
                    bikesList.appendChild(card);
                });
            }
        } else {
            alert("الكود خطأ (جرب 1234)");
        }
    });
});