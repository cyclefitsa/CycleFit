// [1] الإعدادات والاتصال
const SUPABASE_URL = 'https://weuzlifquyzyjyvguvif.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_vEkF99aOD3eu0mq3C-r-Lg_D5h9qDOe'; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// [2] الوظائف الحركية
document.addEventListener('DOMContentLoaded', () => {
    
    // تعريف العناصر
    const mainContent = document.getElementById('main-content');
    const loginScreen = document.getElementById('login-screen');
    const phoneSection = document.getElementById('phone-section');
    const otpSection = document.getElementById('otp-section');
    
    const startBtn = document.getElementById('start-journey-btn');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyBtn = document.getElementById('verify-btn');

    // 1. عند الضغط على انطلق الآن
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            mainContent.style.display = 'none';
            loginScreen.style.display = 'block';
        });
    }

    // 2. عند الضغط على أرسل الرمز
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            const name = document.getElementById('full-name').value;
            const phone = document.getElementById('phone-number').value;

            if (name.length > 2 && phone.length >= 10) {
                document.getElementById('login-title').innerText = "تحقق من الهوية";
                phoneSection.style.display = 'none';
                otpSection.style.display = 'block';
                console.log(`تم إرسال رمز تجريبي للمستخدم: ${name}`);
            } else {
                alert("يرجى إدخال اسمك ورقم جوالك بشكل صحيح");
            }
        });
    }

    // 3. التحقق من الرمز (1234)
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            const code = document.getElementById('otp-input').value;
            const errorMsg = document.getElementById('error-msg');

            if (code === "1234") {
                alert("تم تسجيل الدخول بنجاح! جاري تحويلك لمنصة الدراجات...");
                // ملاحظة: هنا سنضيف كود عرض الدراجات في التحديث القادم
            } else {
                errorMsg.style.display = 'block';
                errorMsg.innerText = "الرمز غير صحيح، جرب الكود التجريبي 1234";
            }
        });
    }
});