alert("أنا أعمل! تم ربط ملف الجافا سكريبت بنجاح");
console.log("تم تشغيل الملف...");
// [1] الأعلى: روابط الاتصال (Keys)
const SUPABASE_URL = 'https://weuzlifquyzyjyvguvif.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_vEkF99aOD3eu0mq3C-r-Lg_D5h9qDOe'; 

// [2] المنتصف: تعريف المكتبة والوظائف
// ملاحظة: تأكد أنك تستخدم s صغيرة في البداية و S كبيرة في createClient
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// وظيفة لجلب الدراجات من القاعدة
async function loadBikes() {
    try {
        const { data, error } = await supabaseClient
            .from('bikes')
            .select('*')
            .order('bike_name', { ascending: true });

        if (error) throw error;

        console.log("تم جلب الدراجات بنجاح:", data);
        return data;
    } catch (err) {
        console.error("فشل في جلب الدراجات:", err.message);
        return null;
    }
}

// [3] الأسفل: الأوامر الحركية (Events)
document.addEventListener('DOMContentLoaded', () => {
    console.log("تم تحميل نظام CycleFit الأخضر...");

    // العناصر (Elements) من ملف الـ HTML الجديد
    const startBtn = document.getElementById('start-journey-btn');
    const mainContent = document.getElementById('main-content');
    const loginScreen = document.getElementById('login-screen');
    const sendOtpBtn = document.getElementById('send-otp');

    // 1. عند الضغط على "انطلق الآن"
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            console.log("بدء الانتقال لشاشة تسجيل الدخول...");
            
            // تأثير بصري سريع قبل الإخفاء
            startBtn.innerText = "جاري التحميل...";
            
            // جلب البيانات من Supabase للتأكد من الاتصال
            const bikes = await loadBikes();

            if (bikes) {
                // إخفاء الواجهة الرئيسية وإظهار شاشة تسجيل الدخول
                mainContent.style.display = 'none';
                loginScreen.style.display = 'block';
                
                // إضافة أنيميشن بسيط للشاشة الجديدة
                loginScreen.style.animation = 'fadeIn 0.5s ease-in';
            } else {
                alert("عذراً، تعذر الاتصال بالنظام. تحقق من الإنترنت.");
                startBtn.innerText = "انطلق الآن";
            }
        });
    }

    // 2. عند الضغط على "أرسل الرمز" في شاشة الدخول
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => {
            const name = document.getElementById('full-name').value;
            const phone = document.getElementById('phone-number').value;

            if (name && phone) {
                alert(`أهلاً يا ${name}! سيتم إرسال الرمز إلى ${phone} قريباً.`);
                // هنا سنقوم لاحقاً بربط كود الـ OTP الحقيقي
            } else {
                alert("يرجى إدخال الاسم ورقم الجوال أولاً.");
            }
        });
    }
});

// إضافة تأثير ظهور ناعم (FadeIn) برمجياً
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);