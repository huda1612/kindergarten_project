function updateCurrentDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const today = new Date();
    document.getElementById('current-date').textContent =
       `اليوم هو ${today.toLocaleDateString('ar-EG', options)}`;
}

// تنفيذ الدوال عند تحميل الصفحة
window.onload = function() {
    updateCurrentDate();
    
    // إضافة حدث النقر لزر تسجيل الخروج
    document.querySelector('.logout-btn').addEventListener('click', function() {
        alert('تم تسجيل الخروج بنجاح');
        // يمكن إضافة توجيه لصفحة تسجيل الدخول هنا
    });
    
    // إضافة أحداث النقر لأزرار القائمة الجانبية
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // إزالة التنشيط من جميع العناصر
            menuItems.forEach(i => i.style.backgroundColor = '');
            // تنشيط العنصر الحالي
            this.style.backgroundColor = '#f0f0f0';
            // يمكن إضافة منطق التوجيه للصفحات هنا
        });
    });
    
    // قسم الأنشطة
document.getElementById('addActivityBtn').addEventListener('click', function() {
    document.getElementById('activityOptions').style.display = 'grid';
    document.getElementById('customActivityField').style.display = 'block';
});

// اختيار نشاط جاهز
document.querySelectorAll('.activity-option').forEach(option => {
    option.addEventListener('click', function() {
        const activityName = this.getAttribute('data-activity');
        addNewActivity(activityName);
    });
});

// إضافة نشاط مخصص
document.getElementById('saveCustomActivity').addEventListener('click', function() {
    const newActivity = document.getElementById('newActivityInput').value.trim();
    if (newActivity) {
        addNewActivity(newActivity);
        document.getElementById('newActivityInput').value = '';
    }
});

function addNewActivity(activityName) {
    const now = new Date();
    const timeString = now.getHours() + ':' + (now.getMinutes()<10?'0':'') + now.getMinutes();
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = 
    document.querySelector('.delete-activity').addEventListener('click', function() {
        // عملية الحذف هنا
    });
    
    document.getElementById('activitiesList').prepend(activityItem);
    
    // إخفاء الخيارات بعد الإضافة
    document.getElementById('activityOptions').style.display = 'none';
    document.getElementById('customActivityField').style.display = 'none';
    
    // إضافة حدث لحذف النشاط
    activityItem.querySelector('.delete-activity').addEventListener('click', function() {
        activityItem.remove();
    });
}
    
    // إضافة حدث لزر رفع ملف
    document.querySelector('.files-section .add-btn').addEventListener('click', function() {
        alert('سيتم فتح نافذة لاختيار الملفات');
    });
};