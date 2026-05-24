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
            bikesList.innerHTML = '<p>جاري التحقق من قاعدة البيانات...</p>';

            try {
                // جلب البيانات
                const { data: bikes, error } = await supabaseClient.from('bikes').select('*');
                
                if (error) {
                    console.error("خطأ من سوبابيس:", error.message);
                    bikesList.innerHTML = `<p style="color:red">خطأ: ${error.message}</p>`;
                    return;
                }

                if (!bikes || bikes.length === 0) {
                    bikesList.innerHTML = '<p>لا توجد دراجات في القاعدة حالياً</p>';
                    return;
                }

                console.log("البيانات المستلمة:", bikes);
                bikesList.innerHTML = ''; 

                bikes.forEach(bike => {
                    // ملاحظة: هنا نتأكد من أسماء الأعمدة (لو كانت مختلفة في جدولك سيظهر اسم undefined)
                    const name = bike.bike_name || bike.name || "دراجة";
                    const status = bike.status || "متاحة";

                    const card = document.createElement('div');
                    card.className = 'bike-card';
                    card.innerHTML = `
                        <div class="bike-info">
                            <h3>${name}</h3>
                            <p>الحالة: ${status}</p>
                        </div>
                        <button class="rent-btn">احجز</button>
                    `;
                    bikesList.appendChild(card);
                });
            } catch (err) {
                console.error("خطأ غير متوقع:", err);
                bikesList.innerHTML = '<p>حدث خطأ أثناء تحميل البيانات</p>';
            }
        } else {
            alert("الكود خطأ (جرب 1234)");
        }
    });
});