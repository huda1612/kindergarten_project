function updateCurrentDate() {
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const today = new Date();
    document.getElementById(
        "current-date"
    ).textContent = `اليوم هو ${today.toLocaleDateString("ar-EG", options)}`;
}

// تنفيذ الدوال عند تحميل الصفحة
window.onload = function () {
    updateCurrentDate();

    // إضافة حدث النقر لزر تسجيل الخروج
    document.querySelector(".logout-btn").addEventListener("click", function () {
        alert("تم تسجيل الخروج بنجاح");
        // يمكن إضافة توجيه لصفحة تسجيل الدخول هنا
    });

    // إضافة أحداث النقر لأزرار القائمة الجانبية
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((item) => {
        item.addEventListener("click", function () {
            // إزالة التنشيط من جميع العناصر
            menuItems.forEach((i) => (i.style.backgroundColor = ""));
            // تنشيط العنصر الحالي
            this.style.backgroundColor = "#f0f0f0";
            // يمكن إضافة منطق التوجيه للصفحات هنا
        });
    });

    // قسم الأنشطة
    document
        .getElementById("addActivityBtn")
        .addEventListener("click", function () {
            document.getElementById("activityOptions").style.display = "grid";
            document.getElementById("customActivityField").style.display = "block";
        });

    // اختيار نشاط جاهز
    document.querySelectorAll(".activity-option").forEach((option) => {
        option.addEventListener("click", function () {
            const activityName = this.getAttribute("data-activity");
            addNewActivity(activityName);
        });
    });

    // إضافة نشاط مخصص
    document
        .getElementById("saveCustomActivity")
        .addEventListener("click", function () {
            const newActivity = document
                .getElementById("newActivityInput")
                .value.trim();
            if (newActivity) {
                addNewActivity(newActivity);
                document.getElementById("newActivityInput").value = "";
            }
        });

    function addNewActivity(activityName) {
        const now = new Date();
        const timeString =
            now.getHours() +
            ":" +
            (now.getMinutes() < 10 ? "0" : "") +
            now.getMinutes();

        const activityItem = document.createElement("div");
        activityItem.className = "activity-item";
        activityItem.innerHTML = document
            .querySelector(".delete-activity")
            .addEventListener("click", function () {
                // عملية الحذف هنا
            });

        document.getElementById("activitiesList").prepend(activityItem);

        // إخفاء الخيارات بعد الإضافة
        document.getElementById("activityOptions").style.display = "none";
        document.getElementById("customActivityField").style.display = "none";

        // إضافة حدث لحذف النشاط
        activityItem
            .querySelector(".delete-activity")
            .addEventListener("click", function () {
                activityItem.remove();
            });
    }



    // إضافة حدث لزر رفع ملف
    document
        .querySelector(".files-section .add-btn")
        .addEventListener("click", function () {
            alert("سيتم فتح نافذة لاختيار الملفات");
        });
};
function toggleActivityOptions() {
    const container = document.getElementById("activityOptions");
    container.style.display =
        container.style.display === "none" ? "block" : "none";
}

async function loadActivities() {
    try {
        const response = await fetch("/api/getActivityNames");
        if (!response.ok) throw new Error("فشل في تحميل الأنشطة");

        const activities = await response.json();
        const container = document.getElementById("activityOptions");
        container.innerHTML = "";

        activities.forEach((act) => {
            const div = document.createElement("div");
            div.classList.add("activity-option");
            div.setAttribute("data-activity", act.name);
            div.style.cursor = "pointer";
            div.style.padding = "10px";
            div.style.borderBottom = "1px solid #eee";

            div.innerHTML = ` <i class="fas ${act.icon}" style="margin-left: 10px;"></i><span>${act.name}</span>`;
            div.addEventListener("click", async () => {
                try {
                    const res = await fetch("/api/insertTodayDailyActivity", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: act.name }),
                    });
                    const result = await res.json();

                    if (result.success) {
                        location.reload();
                    } else {
                        alert("فشل في إضافة النشاط.");
                    }
                } catch (error) {
                    console.error(error);
                    alert("حدث خطأ أثناء الإضافة.");
                }
            });

            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        document.getElementById("activityOptions").innerHTML =
            "<p>خطأ في تحميل الأنشطة</p>";
    }
}

async function loadTodayActivities() {
    try {
        const response = await fetch("/api/getTodayActivityList");
        if (!response.ok) throw new Error("فشل في تحميل أنشطة اليوم");

        const activities = await response.json();
        const container = document.getElementById("todayActivities");
        container.innerHTML = "";

        activities.forEach((act) => {
            const div = document.createElement("div");
            div.classList.add("file-item");
            div.innerHTML = ` <i class="fas ${act.icon}"></i> <span>${act.name}</span>`;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        document.getElementById("todayActivities").innerHTML =
            "<p>خطأ في تحميل أنشطة اليوم</p>";
    }
}

async function loadStudentsNames() {
    try {
        const response = await fetch("/api/getStudentsNames");
        if (!response.ok) throw new Error("فشل تحميل أسماء الطلاب");

        const students = await response.json();
        const container = document.getElementById("students-container");
        container.innerHTML = "";

        students.forEach((student) => {
            const tr = document.createElement("tr");
            const fullName = `${student.first_name} ${student.last_name}`;
            const birthDate = student.birth_date;

            tr.innerHTML = ` <td>${fullName}</td>
                                                                  <td>${birthDate}</td>`;
            container.appendChild(tr);
        });
    } catch (err) {
        console.error("حدث خطأ:", err);

        document.getElementById("students-container").innerHTML =
            `<tr><td colspan="2">فشل في تحميل أسماء الطلاب</td></tr>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadActivities();
    loadTodayActivities();
    loadStudentsNames();
});