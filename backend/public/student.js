// student.js

window.addEventListener("DOMContentLoaded", () => {
    const dateElement = document.getElementById("today-date");
    const today = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    const formattedDate = today.toLocaleDateString("ar-EG", options);
    if (dateElement) {
        dateElement.textContent =` اليوم هو ${formattedDate}`;
    }
});
// إضافة حدث النقر لزر تسجيل الخروج
document.querySelector('.logout-btn').addEventListener('click', function() {
    alert('تم تسجيل الخروج بنجاح');
    // يمكن إضافة توجيه لصفحة تسجيل الدخول هنا
});