const showAddFilebtn = document.getElementById('showAddFilebtn');
const addFileForm = document.getElementById('addFileForm');
const fileDatebtn = document.getElementById('fileDatebtn');
const fileDateForm = document.getElementById('fileDateForm');
const cencelDateSelectFilebtn = document.getElementById('cencelDateSelectFilebtn');
const dateSelectFilebtn = document.getElementById('dateSelectFilebtn');

showAddFilebtn.addEventListener('click', () =>{
    showAddFilebtn.style.display = 'none';
    addFileForm.style.display = 'block';
}); 
cencelAddFilebtn.addEventListener('click', () =>{
    showAddFilebtn.style.display = 'block';
    addFileForm.style.display = 'none';
})

fileDatebtn.addEventListener('click', () =>{
    fileDatebtn.style.display = 'none';
    fileDateForm.style.display = 'block';
})
cencelDateSelectFilebtn.addEventListener('click', () =>{
    fileDatebtn.style.display = 'block';
    fileDateForm.style.display = 'none';
})
dateSelectFilebtn.addEventListener('click', async () =>{
    const form = document.getElementById("fileDateForm");
    const formData = new FormData(form);
    let day = formData.get("day") ;
    let month = formData.get("month");
    let year = formData.get("year");

    day = day.padStart(2, '0');
    month = month.padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    console.log(dateString)
    await loadFiles(dateString)
    fileDatebtn.style.display = 'block';
    fileDateForm.style.display = 'none';
})

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

async function loadTodayEnglishActivities() {
    try {
        const get_class_id = document.getElementById("get_class_id");
        const classId = get_class_id.dataset.classId; 
        const response = await fetch("/api/getTodayEnglishActivityList" ,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
             },
            body: JSON.stringify({ classId: classId })
             });

        if (!response.ok) throw new Error("فشل في تحميل أنشطة اليوم");

        const data = await response.json();
        const notFilterdDailyActivities = data.dailyActivities || [];
        //لاعرضله انشطة الانجليزي بس
        const  dailyActivities = notFilterdDailyActivities.filter(activity => activity.type === 'english');
        const container = document.getElementById("todayActivities");
        container.innerHTML = "";

        if (dailyActivities.length === 0) {
            container.innerHTML = "<p>لا توجد أنشطة مضافة اليوم</p>";
            const activitySelect = document.getElementById('activitySelect');
            activitySelect.innerHTML = "";
            activitySelect.innerHTML ="<option value='null' selected>لا شيء </option>"
            return;
        }

        const activitySelect = document.getElementById('activitySelect');
        activitySelect.innerHTML = "";
        activitySelect.innerHTML ="<option value='null' selected>لا شيء </option>"

        dailyActivities.forEach(act => {
            const opt = document.createElement("option");
            opt.value = act.id;
            opt.textContent = act.name;
            activitySelect.appendChild(opt);
        });


        dailyActivities.forEach((act) => {
            const div = document.createElement("div");
            div.classList.add("activity-item");
            

            let html = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas ${act.icon}" style="font-size: 20px; color :#e74c3c"></i>
                    <div>
                        <strong>${act.name}</strong><br/>
                        <small>${act.description || "بدون وصف"}</small>
                    </div>
                </div>
            `;

            //اضافة زر الحذف
             html += `
                <button class="delete-btn">
                    حذف
                </button>`;
            
             div.innerHTML = html;

            //عند الضغط على زر الحذف
             div.querySelector(".delete-btn").addEventListener("click", async () => {
                    if (confirm("هل أنت متأكد من حذف النشاط؟")) {
                        try {
                            console.log("ضغط على زر الحذف لنشاط:", act.name);

                            const res = await fetch("/api/deleteDailyEnglishActivity", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ activityName: act.name , classId : classId })
                            });

                            const result = await res.json();
                            if (result.success) {
                                div.remove();
                                const activitySelect = document.getElementById('activitySelect');
                                const optionToRemove = Array.from(activitySelect.options).find(
                                opt => opt.value === act.id || opt.value === String(act.id)
                                );
                                if (optionToRemove) {
                                    optionToRemove.remove();
                                }

                            } else {
                                alert("فشل في حذف النشاط.");
                            }
                        } catch (error) {
                            console.error(error);
                            alert("حدث خطأ أثناء الحذف.");
                        }
                    }
                });
            

            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        document.getElementById("todayActivities").innerHTML =
            "<p>خطأ في تحميل أنشطة اليوم</p>";
    }
}

async function loadFiles(date) {
    try{ 
     const get_class_id = document.getElementById("get_class_id");
     const classId = get_class_id.dataset.classId;
     const response = await fetch("/api/getFileList" ,{
            method: "POST",
            headers: {
            "Content-Type": "application/json"
             },
            body: JSON.stringify({ classId : classId , date : date})
             });
     if (!response.ok) throw new Error("فشل في تحميل ملفات اليوم");

     const data = await response.json();
     const NotFilterdDailyFiles = data.flies || [];


     const container = document.getElementById("todayFiles");
     container.innerHTML = "";

     //لاعرضلها فقط ملفات الانجليزي
     const dailyFiles = NotFilterdDailyFiles.filter(files => files.type === 'english');
        
    
        
        if (dailyFiles.length === 0) {
            container.innerHTML = `<p>لا توجد ملفات مضافة لهذا اليوم ${date}</p>`;
            return;
        }

        dailyFiles.forEach((file) => {
            const div = document.createElement("div");
            div.className = "file-item";

            let html =`
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-file" style="font-size: 20px; color :#e74c3c"></i>
                    <div>
                        <strong>${file.name}</strong><br/>
                        <small>${file.activity_name || "لا يتعلق بنشاط محدد"}</small>
                        <br>
                        <small>${file.description || "بدون وصف"}</small>
                        <a href=${file.path} class = "download-btn" download>  <button>تحميل</button> </a>
                    </div>
                </div>
            `
           
            
                html += `
                <button class="fileDelete-btn">
                حذف
                </button>`;
            
             div.innerHTML = html;


            div.querySelector(".fileDelete-btn").addEventListener("click", async () => {
                    if (confirm("هل أنت متأكد من حذف الملف ؟")) {
                        try {

                            const res = await fetch("/api/deleteFile", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({ fileId: file.id , classId : classId , filePath : file.path })
                            });

                            const result = await res.json();
                            if (result.success) {
                                 div.remove();
                               
                            } else {
                                alert("فشل في حذف الملف.");
                            }
                        } catch (error) {
                            console.error(error);
                            alert("حدث خطأ أثناء الحذف.");
                        }
                    }
                });
            
            container.appendChild(div);
        });
            
    }catch(err){
        console.error(err);
        document.getElementById("todayFiles").innerHTML =
            "<p>خطأ في تحميل ملفات اليوم</p>";
    }}




window.onload = function () {
    updateCurrentDate();

    // إضافة حدث النقر لزر تسجيل الخروج
    document.querySelector(".logout-btn").addEventListener("click", function () {
        alert("تم تسجيل الخروج بنجاح");
    });

    // أزرار القائمة الجانبية
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((item) => {
        item.addEventListener("click", function () {
            menuItems.forEach((i) => (i.style.backgroundColor = ""));
            this.style.backgroundColor = "#f0f0f0";
        });
    });

    // قسم الأنشطة
    document.getElementById("addActivityBtn").addEventListener("click", function () {
        document.getElementById("activityOptions").style.display = "grid";
        document.getElementById("customActivityField").style.display = "block";
    });

    // ✅ [تم التعليق] اختيار نشاط جاهز
    /* 
    document.querySelectorAll(".activity-option").forEach((option) => {
        option.addEventListener("click", function () {
            const activityName = this.getAttribute("data-activity");
            addNewActivity(activityName);
        });
    });
    */

    // إضافة نشاط مخصص
    document.getElementById("saveCustomActivity").addEventListener("click", function () {
        const newActivity = document.getElementById("newActivityInput").value.trim();
        if (newActivity) {
            addNewActivity(newActivity);
            document.getElementById("newActivityInput").value = "";
        }
    });

    function addNewActivity(activityName) {
        const now = new Date();
        const timeString = now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();

        const activityItem = document.createElement("div");
        activityItem.className = "activity-item";
        activityItem.innerHTML = `
            <span>${activityName}</span>
            <button class="delete-activity">حذف</button>
        `;

        document.getElementById("activitiesList").prepend(activityItem);

        document.getElementById("activityOptions").style.display = "none";
        document.getElementById("customActivityField").style.display = "none";

        activityItem.querySelector(".delete-activity").addEventListener("click", function () {
            activityItem.remove();
        });
    }

    // رفع ملف
    document.querySelector(".files-section .add-btn").addEventListener("click", function () {
        alert("سيتم فتح نافذة لاختيار الملفات");
    });
};

function toggleActivityOptions() {
    const container = document.getElementById("activityOptions");
    container.style.display = container.style.display === "none" ? "block" : "none";
}



document.addEventListener("DOMContentLoaded", async() => {
    await loadTodayEnglishActivities();
    const today = new Date().toLocaleDateString('sv-SE'); // يعطي "2025-07-18"
    await loadFiles(today);
    
});
