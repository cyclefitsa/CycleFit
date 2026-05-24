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
            bikesList.innerHTML = '<p style="color:var(--energy-lime)">جاري سحب الدراجات من جازان...</p>';

            try {
                // جلب البيانات مع تحديد الجدول بدقة
                const { data: bikes, error } = await supabaseClient
                    .from('bikes') // تأكد أن الاسم في سوبابيس صغير bikes
                    .select('*');
                
                if (error) {
                    console.error("خطأ سوبابيس:", error);
                    bikesList.innerHTML = `
                        <div style="background:rgba(255,0,0,0.1); padding:15px; border-radius:10px;">
                            <p style="color:#ff6b6b">اسم الجدول غير موجود في سوبابيس!</p>
                            <p style="font-size:0.8rem">الخطأ: ${error.message}</p>
                            <button onclick="location.reload()" style="background:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer">إعادة محاولة</button>
                        </div>`;
                    return;
                }

                if (!bikes || bikes.length === 0) {
                    bikesList.innerHTML = '<p>الجدول فارغ، أضف دراجات في سوبابيس أولاً</p>';
                    return;
                }

                bikesList.innerHTML = ''; 
                bikes.forEach(bike => {
                    // نستخدم || لتوقع أي اسم عمود (name أو bike_name)
                    const bName = bike.bike_name || bike.name || "دراجة كلاسيك";
                    const bStatus = bike.status === 'available' ? '✅ متاحة' : '❌ محجوزة';

                    const card = document.createElement('div');
                    card.className = 'bike-card';
                    card.innerHTML = `
                        <div class="bike-info">
                            <h3>${bName}</h3>
                            <p>${bStatus}</p>
                        </div>
                        <button class="rent-btn" onclick="alert('جاري تجهيز طلبك...')">احجز</button>
                    `;
                    bikesList.appendChild(card);
                });

            } catch (err) {
                bikesList.innerHTML = '<p>حدث خطأ في الشبكة</p>';
            }
        } else {
            alert("الكود خطأ (جرب 1234)");
        }
    });
});