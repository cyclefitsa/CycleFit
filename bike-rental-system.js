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

    startBtn.addEventListener('click', () => {
        mainContent.style.display = 'none';
        loginScreen.style.display = 'block';
    });

    sendOtpBtn.addEventListener('click', () => {
        if (document.getElementById('full-name').value) {
            document.getElementById('phone-section').style.display = 'none';
            document.getElementById('otp-section').style.display = 'block';
        }
    });

    verifyBtn.addEventListener('click', async () => {
        const code = document.getElementById('otp-input').value;
        if (code === "1234") {
            loginScreen.style.display = 'none';
            bikesScreen.style.display = 'block';
            bikesList.innerHTML = '<p>جاري جلب البيانات...</p>';

            try {
                // محاولة جلب البيانات من سوبابيس
                let { data: bikes, error } = await supabaseClient.from('bikes').select('*');
                
                // إذا لم توجد بيانات أو حدث خطأ، سنعرض بيانات تجريبية مؤقتاً لكي لا تظل الشاشة فارغة
                if (error || !bikes || bikes.length === 0) {
                    console.log("استخدام البيانات التجريبية بسبب:", error ? error.message : "الجدول فارغ");
                    bikes = [
                        { bike_name: "دراجة A01", status: "available" },
                        { bike_name: "دراجة A02", status: "available" },
                        { bike_name: "دراجة A03", status: "rented" },
                        { bike_name: "دراجة A04", status: "available" }
                    ];
                }

                bikesList.innerHTML = ''; 
                bikes.forEach(bike => {
                    const name = bike.bike_name || bike.name || "دراجة";
                    const statusText = bike.status === 'available' ? '✅ متاحة' : '❌ محجوزة';
                    const isAvailable = bike.status === 'available';

                    const card = document.createElement('div');
                    card.className = 'bike-card';
                    card.innerHTML = `
                        <div class="bike-info">
                            <h3>${name}</h3>
                            <p>${statusText}</p>
                        </div>
                        <button class="rent-btn" ${!isAvailable ? 'disabled style="opacity:0.5"' : ''}>
                            ${isAvailable ? 'احجز الآن' : 'غير متوفرة'}
                        </button>
                    `;
                    bikesList.appendChild(card);
                });

            } catch (err) {
                console.error("خطأ:", err);
                bikesList.innerHTML = '<p>حدث خطأ فني</p>';
            }
        } else {
            alert("الكود 1234");
        }
    });
});