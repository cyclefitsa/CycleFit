import React, { useState, useEffect } from 'react';
import { Clock, Bike, CreditCard, DollarSign, Gift, CheckCircle, LogOut, BarChart3, Users, Cloud, MapPin, Navigation, Bell, AlertCircle } from 'lucide-react';

// محاكاة Firebase في الـ Local Storage
class FirebaseDB {
  constructor() {
    this.data = JSON.parse(localStorage.getItem('bikeRentalDB')) || {
      users: {},
      rentals: [],
      loyalty: {}
    };
  }

  saveUser(phone, userData) {
    this.data.users[phone] = {
      phone,
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.save();
  }

  getUser(phone) {
    return this.data.users[phone] || null;
  }

  saveRental(rental) {
    this.data.rentals.push({
      ...rental,
      createdAt: new Date().toISOString()
    });
    this.save();
  }

  updateRental(rentalId, updates) {
    const rental = this.data.rentals.find(r => r.id === rentalId);
    if (rental) {
      Object.assign(rental, updates);
      this.save();
    }
  }

  getAllRentals() {
    return this.data.rentals;
  }

  getUserRentals(phone) {
    return this.data.rentals.filter(r => r.phone === phone);
  }

  saveLoyaltyPoints(phone, points) {
    this.data.loyalty[phone] = {
      phone,
      points,
      updatedAt: new Date().toISOString()
    };
    this.save();
  }

  getLoyaltyPoints(phone) {
    return this.data.loyalty[phone]?.points || 0;
  }

  save() {
    localStorage.setItem('bikeRentalDB', JSON.stringify(this.data));
  }

  clearAll() {
    this.data = { users: {}, rentals: [], loyalty: {} };
    this.save();
  }
}

const db = new FirebaseDB();

const BikeRentalSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stage, setStage] = useState('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [selectedBike, setSelectedBike] = useState(null);
  const [duration, setDuration] = useState(15);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [activeRental, setActiveRental] = useState(null);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [bikes] = useState([
    { id: 1, name: 'City Cruiser', price: 5, image: '🚲' },
    { id: 2, name: 'Mountain Beast', price: 8, image: '🚵' },
    { id: 3, name: 'Speed Demon', price: 10, image: '🏍️' },
    { id: 4, name: 'Electric Ride', price: 15, image: '⚡' }
  ]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 24.7136, lng: 46.6753 });
  const [bikeLocations, setBikeLocations] = useState({
    1: { lat: 24.7136, lng: 46.6753, name: 'City Cruiser' },
    2: { lat: 24.7500, lng: 46.7000, name: 'Mountain Beast' },
    3: { lat: 24.7200, lng: 46.6800, name: 'Speed Demon' },
    4: { lat: 24.7300, lng: 46.6900, name: 'Electric Ride' }
  });
  const [showMap, setShowMap] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => console.log('Location access denied')
      );
    }
  }, []);

  // Animate bike locations
  useEffect(() => {
    const interval = setInterval(() => {
      setBikeLocations(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            ...updated[key],
            lat: updated[key].lat + (Math.random() - 0.5) * 0.002,
            lng: updated[key].lng + (Math.random() - 0.5) * 0.002
          };
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Timer for tracking rental
  useEffect(() => {
    let interval;
    if (activeRental?.status === 'active') {
      interval = setInterval(() => {
        setActiveRental(prev => ({
          ...prev,
          elapsed: (prev.elapsed || 0) + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeRental?.status]);

  // Notification system
  const showNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    setNotifications(prev => [...prev, notification]);
    playNotificationSound();
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const showAdminNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date() };
    setAdminNotifications(prev => [...prev, notification]);
    playNotificationSound();
    setTimeout(() => {
      setAdminNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log('Sound not supported');
    }
  };

  const generateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length >= 10) {
      db.saveUser(phone, { lastLogin: new Date().toISOString() });
      generateOtp();
      showNotification('✅ تم إرسال رمز التحقق إلى جوالك', 'success', 3000);
      setStage('otp');
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      const userData = db.getUser(phone);
      const points = db.getLoyaltyPoints(phone);
      const userRentals = db.getUserRentals(phone);
      setCurrentUser(userData);
      setLoyaltyPoints(points);
      setRentalHistory(userRentals);
      showNotification('🎉 مرحباً بك! تم التحقق بنجاح', 'success', 3000);
      setStage('select-bike');
    } else {
      showNotification('❌ رمز التحقق غير صحيح', 'error', 3000);
    }
  };

  const handleBikeSelect = (bike) => {
    setSelectedBike(bike);
  };

  const calculatePrice = () => {
    if (!selectedBike) return 0;
    return (selectedBike.price * duration) / 60;
  };

  const handlePaymentSubmit = (method) => {
    setPaymentMethod(method);
    const rental = {
      id: Math.random().toString(36).substr(2, 9),
      bike: selectedBike,
      duration,
      price: calculatePrice(),
      paymentMethod: method,
      status: 'pending',
      startTime: new Date().toISOString(),
      elapsed: 0,
      phone: currentUser.phone
    };

    db.saveRental(rental);

    if (method === 'cash') {
      setPendingApprovals([...pendingApprovals, rental]);
      showNotification('💵 في انتظار تأكيد الموظف', 'warning', 5000);
      showAdminNotification(`📍 طلب دفع كاش جديد من ${currentUser.phone}`, 'warning');
      setStage('confirmation');
    } else {
      showNotification('💳 جاري معالجة الدفع...', 'info', 2000);
      setTimeout(() => {
        rental.status = 'active';
        db.updateRental(rental.id, { status: 'active' });
        setActiveRental(rental);
        setRentalHistory([...rentalHistory, rental]);
        showNotification('✅ تم الدفع بنجاح! استمتع برحلتك 🚲', 'success', 3000);
        showAdminNotification(`🚴 رحلة جديدة نشطة`, 'info');
        setStage('tracking');
      }, 2000);
    }
  };

  const approveRental = (rentalId) => {
    const rental = pendingApprovals.find(r => r.id === rentalId);
    if (rental) {
      rental.status = 'active';
      db.updateRental(rentalId, { status: 'active' });
      setActiveRental(rental);
      setRentalHistory([...rentalHistory, rental]);
      setPendingApprovals(pendingApprovals.filter(r => r.id !== rentalId));
      showAdminNotification('✅ تم تأكيد الدفع', 'success');
    }
  };

  const endRental = () => {
    if (activeRental) {
      const completedRental = {
        ...activeRental,
        status: 'completed',
        endTime: new Date().toISOString()
      };
      setActiveRental(null);
      const updatedHistory = rentalHistory.map(r => 
        r.id === completedRental.id ? completedRental : r
      );
      setRentalHistory(updatedHistory);
      db.updateRental(completedRental.id, { status: 'completed', endTime: completedRental.endTime });

      const hours = completedRental.elapsed / 3600;
      const freeHours = Math.floor(hours / 5);
      const newPoints = loyaltyPoints + freeHours;
      setLoyaltyPoints(newPoints);
      db.saveLoyaltyPoints(currentUser.phone, newPoints);

      showNotification(`✅ انتهت الرحلة! الإجمالي: ${completedRental.price.toFixed(2)} ر.س`, 'success', 4000);
      if (freeHours > 0) {
        showNotification(`🎁 حصلت على ${freeHours} ساعة مجانية! 🎉`, 'success', 5000);
      }
      showAdminNotification('✓ رحلة مكتملة', 'success');
      
      setStage('login');
      setCurrentUser(null);
      setPhone('');
      setOtp('');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    return `${minutes}m ${secs}s`;
  };

  // Notification Component
  const NotificationCenter = ({ notifs }) => (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
      {notifs.map(notif => (
        <div key={notif.id} className={`rounded-lg shadow-2xl p-4 text-white animate-slide-in ${
          notif.type === 'success' ? 'bg-emerald-500' :
          notif.type === 'error' ? 'bg-red-500' :
          notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
        }`}>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              {notif.type === 'success' && <CheckCircle size={20} />}
              {notif.type === 'error' && <AlertCircle size={20} />}
              {notif.type === 'warning' && <AlertCircle size={20} />}
              {notif.type === 'info' && <Bell size={20} />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{notif.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {notif.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Map Component
  const MapComponent = ({ onBikeSelect }) => (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-300 overflow-hidden">
      <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-emerald-600" />
            <span className="font-bold text-gray-900">الرياض - المملكة العربية السعودية</span>
          </div>
        </div>

        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 animate-pulse"
          style={{ left: `${((userLocation.lng - 46.5) / 0.5) * 100}%`, top: `${((24.8 - userLocation.lat) / 0.2) * 100}%` }}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-30 animate-ping" style={{ width: '40px', height: '40px', left: '-20px', top: '-20px' }}></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        </div>

        {Object.entries(bikeLocations).map(([id, location]) => (
          <div key={id} className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:z-30 transition-all hover:scale-125"
            style={{ left: `${((location.lng - 46.5) / 0.5) * 100}%`, top: `${((24.8 - location.lat) / 0.2) * 100}%` }}
            onClick={() => onBikeSelect && onBikeSelect(parseInt(id))}>
            <div className="relative">
              <div className="bg-emerald-500 rounded-full p-2 shadow-lg hover:shadow-2xl transition-shadow border-2 border-white cursor-pointer transform hover:scale-110">
                <span className="text-2xl block">{bikes.find(b => b.id === parseInt(id))?.image || '🚲'}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs space-y-2 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>موقعك</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ============ LOGIN ============
  if (stage === 'login' && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <NotificationCenter notifs={notifications} />
        <div className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
            <span className="text-5xl">🚲</span> BikeFlow
          </div>
          <button onClick={() => setIsAdmin(!isAdmin)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium text-sm">
            {isAdmin ? 'عودة للعميل' : 'لوحة الموظف'}
          </button>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">أهلاً وسهلاً</h1>
            <p className="text-gray-600 text-center mb-8">استمتع برحلة مريحة مع دراجاتنا</p>

            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الجوال</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-4 bg-gray-100 rounded-lg font-semibold text-gray-600">+966</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="501234567" className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition" />
                </div>
              </div>

              <button type="submit" disabled={phone.length < 9} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                تحقق من الرقم
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm mb-4">📍 المزايا</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <span className="text-sm">حجز فوري بدون تعقيد</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <span className="text-sm">طرق دفع متعددة آمنة</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎁</span>
                  <span className="text-sm">برنامج ولاء حصري</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ OTP ============
  if (stage === 'otp' && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <NotificationCenter notifs={notifications} />
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <button onClick={() => setStage('login')} className="mb-6 text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2">← عودة</button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">تحقق من الرمز</h1>
          <p className="text-gray-600 text-center mb-8">أرسلنا رمز التحقق إلى {'+966' + phone}</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <p className="font-mono text-2xl font-bold text-blue-700 text-center">{generatedOtp}</p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">أدخل الرمز</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="w-full px-4 py-4 text-center text-2xl border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 tracking-widest font-mono" />
            </div>

            <button type="submit" disabled={otp.length !== 6} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50">
              تأكيد
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============ SELECT BIKE ============
  if (stage === 'select-bike' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6">
        <NotificationCenter notifs={notifications} />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-5xl">🚲</span> اختر دراجتك
            </h1>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowMap(!showMap)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2">
                <Navigation size={18} /> {showMap ? 'إغلاق الخريطة' : 'فتح الخريطة'}
              </button>
              <button onClick={() => setStage('profile')} className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg font-medium">👤 الملف الشخصي</button>
              <div className="text-right">
                <p className="text-sm text-gray-600">مرحباً</p>
                <p className="font-bold text-gray-900">{currentUser.phone}</p>
              </div>
              <button onClick={() => { setCurrentUser(null); setStage('login'); setPhone(''); setOtp(''); }} className="p-3 bg-red-100 hover:bg-red-200 rounded-lg text-red-600">
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {showMap && (
            <div className="mb-8 bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-emerald-600" /> خريطة الدراجات المتاحة
              </h2>
              <MapComponent onBikeSelect={(bikeId) => {
                const bike = bikes.find(b => b.id === bikeId);
                if (bike) {
                  handleBikeSelect(bike);
                  setShowMap(false);
                }
              }} />
              <p className="text-sm text-gray-600 mt-4">💡 اضغط على أي دراجة في الخريطة لتحديدها</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {bikes.map(bike => (
              <div key={bike.id} onClick={() => handleBikeSelect(bike)} className={`p-6 rounded-2xl cursor-pointer transition-all transform hover:scale-105 ${
                selectedBike?.id === bike.id ? 'bg-emerald-500 text-white shadow-2xl scale-105' : 'bg-white shadow-lg hover:shadow-xl'
              }`}>
                <div className="text-6xl mb-4 text-center">{bike.image}</div>
                <h3 className="text-lg font-bold text-center mb-2">{bike.name}</h3>
                <p className={`text-center text-sm font-semibold ${selectedBike?.id === bike.id ? 'text-emerald-100' : 'text-gray-600'}`}>
                  {bike.price} ر.س / الساعة
                </p>
              </div>
            ))}
          </div>

          {selectedBike && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">اختر المدة الزمنية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[15, 30, 60].map(min => (
                  <div key={min} onClick={() => setDuration(min)} className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    duration === min ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}>
                    <Clock className={`mb-3 ${duration === min ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <p className="text-3xl font-bold text-gray-900 mb-2">{min}</p>
                    <p className="text-gray-600 mb-4">دقيقة</p>
                    <p className={`text-xl font-bold ${duration === min ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {calculatePrice().toFixed(2)} ر.س
                    </p>
                  </div>
                ))}
              </div>

              <button onClick={() => setStage('payment')} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition">
                اختر طريقة الدفع →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ PAYMENT ============
  if (stage === 'payment' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6">
        <NotificationCenter notifs={notifications} />
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setStage('select-bike')} className="mb-6 text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2">← العودة</button>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">تفاصيل الطلب</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>الدراجة:</span>
                <span className="font-bold">{selectedBike.name}</span>
              </div>
              <div className="flex justify-between">
                <span>المدة:</span>
                <span className="font-bold">{duration} دقيقة</span>
              </div>
              <div className="flex justify-between">
                <span>السعر:</span>
                <span className="font-bold">{selectedBike.price} ر.س/ساعة</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold">
                <span>الإجمالي:</span>
                <span className="text-emerald-600">{calculatePrice().toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">اختر طريقة الدفع</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={() => handlePaymentSubmit('apple-pay')} className="p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-500 cursor-pointer transition hover:shadow-lg bg-white">
              <div className="text-4xl mb-4">🍎</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Apple Pay</h3>
              <p className="text-sm text-gray-600">دفع فوري وآمن</p>
            </div>

            <div onClick={() => handlePaymentSubmit('credit-card')} className="p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-500 cursor-pointer transition hover:shadow-lg bg-white">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">بطاقة ائتمان</h3>
              <p className="text-sm text-gray-600">Visa / Mastercard</p>
            </div>

            <div onClick={() => handlePaymentSubmit('cash')} className="p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-500 cursor-pointer transition hover:shadow-lg bg-white">
              <div className="text-4xl mb-4">💵</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">دفع كاش</h3>
              <p className="text-sm text-gray-600">ادفع للموظف مباشرة</p>
            </div>

            {loyaltyPoints >= 60 && (
              <div onClick={() => {
                const rental = {
                  id: Math.random().toString(36).substr(2, 9),
                  bike: selectedBike,
                  duration,
                  price: 0,
                  paymentMethod: 'loyalty',
                  status: 'active',
                  startTime: new Date().toISOString(),
                  elapsed: 0,
                  phone: currentUser.phone
                };
                setLoyaltyPoints(prev => prev - 60);
                setActiveRental(rental);
                setRentalHistory([...rentalHistory, rental]);
                setStage('tracking');
              }} className="p-6 rounded-xl border-2 border-amber-300 cursor-pointer transition hover:shadow-lg bg-amber-50">
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="text-lg font-bold text-amber-900 mb-2">ساعة مجانية</h3>
                <p className="text-sm text-amber-700">النقاط: {loyaltyPoints}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ CONFIRMATION ============
  if (stage === 'confirmation' && currentUser && pendingApprovals.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <NotificationCenter notifs={notifications} />
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-6 animate-bounce">⏳</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">في انتظار التأكيد</h1>
          <p className="text-gray-600 mb-6">يرجى إعطاء جهاز الدفع للموظف لتأكيد الطلب</p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700 mb-2">رقم الطلب:</p>
            <p className="text-2xl font-mono font-bold text-blue-600">{pendingApprovals[0]?.id}</p>
          </div>

          <div className="space-y-3 mb-6 text-left">
            <div className="flex justify-between text-gray-700">
              <span>الدراجة:</span>
              <span className="font-bold">{pendingApprovals[0]?.bike.name}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>المبلغ:</span>
              <span className="font-bold">{pendingApprovals[0]?.price.toFixed(2)} ر.س</span>
            </div>
          </div>

          <button onClick={() => { setStage('login'); setCurrentUser(null); setPhone(''); }} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300">
            الانتظار...
          </button>
        </div>
      </div>
    );
  }

  // ============ TRACKING ============
  if (stage === 'tracking' && activeRental?.status === 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6">
        <NotificationCenter notifs={notifications} />
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🚴 في الرحلة</h1>
            <div className="text-right">
              <p className="text-sm text-gray-600">رقم الطلب</p>
              <p className="font-mono text-lg font-bold text-emerald-600">{activeRental.id}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-emerald-600" /> تتبع الرحلة الحية
            </h3>
            <div className="relative w-full h-80 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-300 overflow-hidden">
              <div className="relative w-full h-full">
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  <defs>
                    <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid2)" />
                </svg>

                <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: '20%', top: '50%' }}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full opacity-30" style={{ width: '30px', height: '30px', left: '-15px', top: '-15px' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                  </div>
                </div>

                <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 animate-pulse" style={{ left: '70%', top: '50%' }}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-40 animate-ping" style={{ width: '50px', height: '50px', left: '-25px', top: '-25px' }}></div>
                    <div className="bg-emerald-500 rounded-full p-3 shadow-2xl border-2 border-white">
                      <span className="text-2xl block">{activeRental.bike.image}</span>
                    </div>
                  </div>
                </div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="20%" y1="50%" x2="70%" y2="50%" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <p className="text-gray-600 mb-4 font-semibold">الوقت المنقضي</p>
              <p className="text-5xl font-bold text-emerald-600 font-mono mb-4">
                {formatTime(activeRental.elapsed || 0)}
              </p>
              <p className="text-gray-700">من {activeRental.duration} دقيقة</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <p className="text-6xl mb-4">{activeRental.bike.image}</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeRental.bike.name}</h3>
              <p className="text-gray-600">محجوزة لك</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">التكلفة الحالية</h3>
            <div className="flex justify-between items-center text-2xl mb-4">
              <span className="text-gray-700">{activeRental.bike.price} ر.س/ساعة</span>
              <span className="text-emerald-600 font-bold">
                {((activeRental.elapsed || 0) / 3600 * activeRental.bike.price).toFixed(2)} ر.س
              </span>
            </div>
          </div>

          <button onClick={endRental} className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition">
            إنهاء الرحلة
          </button>
        </div>
      </div>
    );
  }

  // ============ PROFILE ============
  if (stage === 'profile' && currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6">
        <NotificationCenter notifs={notifications} />
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setStage('select-bike')} className="mb-6 text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2">← عودة</button>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">الملف الشخصي</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">رقم الجوال</p>
                <p className="text-2xl font-bold text-gray-900">{currentUser.phone}</p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">نقاط الولاء</p>
                <p className="text-2xl font-bold text-amber-600">{loyaltyPoints}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">إجمالي الرحلات</p>
                <p className="text-2xl font-bold text-blue-600">{rentalHistory.length}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائياتك</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">الوقت الكلي</p>
                  <p className="text-xl font-bold text-gray-900">
                    {(rentalHistory.reduce((sum, r) => sum + (r.elapsed || 0), 0) / 3600).toFixed(1)} ساعة
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">المبلغ المدفوع</p>
                  <p className="text-xl font-bold text-gray-900">
                    {rentalHistory.reduce((sum, r) => sum + r.price, 0).toFixed(2)} ر.س
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">سجل الرحلات</h2>
            
            {rentalHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">لا توجد رحلات بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rentalHistory.slice().reverse().map(rental => (
                  <div key={rental.id} className="border-l-4 border-emerald-500 bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-2xl mb-2">{rental.bike.image}</p>
                        <h4 className="text-lg font-bold text-gray-900">{rental.bike.name}</h4>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        rental.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        rental.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {rental.status === 'completed' ? '✓ مكتملة' : rental.status === 'active' ? '🔴 نشطة' : '⏳ معلقة'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">التاريخ</p>
                        <p className="font-semibold text-gray-900">{new Date(rental.startTime).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">الوقت</p>
                        <p className="font-semibold text-gray-900">{new Date(rental.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">المدة</p>
                        <p className="font-semibold text-gray-900">{rental.duration} دقيقة</p>
                      </div>
                      <div>
                        <p className="text-gray-600">السعر</p>
                        <p className="font-semibold text-emerald-600">{rental.price.toFixed(2)} ر.س</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => { setCurrentUser(null); setRentalHistory([]); setLoyaltyPoints(0); setStage('login'); setPhone(''); setOtp(''); }} className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition">
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  // ============ ADMIN DASHBOARD ============
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <NotificationCenter notifs={adminNotifications} />
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <span className="text-5xl">⚙️</span> لوحة التحكم
            </h1>
            <button onClick={() => { setIsAdmin(false); setStage('login'); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium">
              تسجيل الخروج
            </button>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users size={28} /> الطلبات المعلقة ({pendingApprovals.length})
            </h2>
            
            {pendingApprovals.length === 0 ? (
              <div className="bg-slate-700 rounded-lg p-8 text-center text-gray-400">
                لا توجد طلبات معلقة
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingApprovals.map(rental => (
                  <div key={rental.id} className="bg-slate-700 rounded-lg p-6 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg mb-2">رقم الطلب: {rental.id}</p>
                      <p className="text-gray-300">الهاتف: {rental.phone}</p>
                      <p className="text-gray-300">الدراجة: {rental.bike.name}</p>
                      <p className="text-gray-300">المبلغ: {rental.price.toFixed(2)} ر.س</p>
                    </div>
                    <button onClick={() => approveRental(rental.id)} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold text-white transition">
                      ✓ تأكيد
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Bike size={28} /> الرحلات النشطة
            </h2>
            
            {activeRental ? (
              <div className="bg-emerald-900 rounded-lg p-6 border-l-4 border-emerald-400">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">الهاتف</p>
                    <p className="text-xl font-bold">{activeRental.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">الدراجة</p>
                    <p className="text-xl font-bold">{activeRental.bike.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm mb-1">الوقت المنقضي</p>
                    <p className="text-xl font-bold font-mono">{formatTime(activeRental.elapsed || 0)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-700 rounded-lg p-8 text-center text-gray-400">
                لا توجد رحلات نشطة
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">إجمالي الرحلات</p>
              <p className="text-4xl font-bold">{rentalHistory.length}</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">الإيرادات</p>
              <p className="text-4xl font-bold">
                {rentalHistory.reduce((sum, r) => sum + r.price, 0).toFixed(2)} ر.س
              </p>
            </div>
            <div className="bg-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">الرحلات المكتملة</p>
              <p className="text-4xl font-bold">
                {rentalHistory.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BikeRentalSystem;

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .animate-slide-in {
      animation: slideIn 0.4s ease-out;
    }
  `;
  document.head.appendChild(style);
}
