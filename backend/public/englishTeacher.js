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
const cencelAddFilebtn = document.getElementById('cencelAddFilebtn');
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

let currentActivitiesDate = new Date().toISOString().split('T')[0];
// إضافة بعد دالة updateCurrentDate:
// ========== عرض أنشطة يوم آخر =============
const showActivitiesByDateBtn = document.getElementById('showActivitiesByDateBtn');
const activitiesByDateForm = document.getElementById('activitiesByDateForm');
const activitiesDateInput = document.getElementById('activitiesDateInput');
const showActivitiesBtn = document.getElementById('showActivitiesBtn');
const cancelShowActivitiesBtn = document.getElementById('cancelShowActivitiesBtn');

showActivitiesByDateBtn.addEventListener('click', () => {
  activitiesByDateForm.style.display = 'block';
  showActivitiesByDateBtn.style.display = 'none';
  // تعيين اليوم الحالي كقيمة افتراضية
  activitiesDateInput.value = new Date().toISOString().split('T')[0];
});

cancelShowActivitiesBtn.addEventListener('click', () => {
  activitiesByDateForm.style.display = 'none';
  showActivitiesByDateBtn.style.display = 'inline-block';
});

showActivitiesBtn.addEventListener('click', async () => {
  const date = activitiesDateInput.value;
  if (!date) {
    alert('يرجى اختيار تاريخ');
    return;
  }
  await loadTodayEnglishActivities(date);
  activitiesByDateForm.style.display = 'none';
  showActivitiesByDateBtn.style.display = 'inline-block';
});

async function loadTodayEnglishActivities(date = null) {
    try {
        currentActivitiesDate = date || new Date().toISOString().split('T')[0];
      const get_class_id = document.getElementById("get_class_id");
      const classId = get_class_id.dataset.classId;
      
      let url = '/api/getTodayEnglishActivityList';
      let body = { classId: classId };
      
      if (date) {
        body.date = date;
      }
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

        if (!response.ok) throw new Error("فشل في تحميل أنشطة اليوم");

        const data = await response.json();
        const notFilterdDailyActivities = data.dailyActivities || [];
        //لاعرضله انشطة الانجليزي بس
        const  dailyActivities = notFilterdDailyActivities.filter(activity => activity.type === 'english');
        const container = document.getElementById("todayActivities");
        container.innerHTML = "";

        if (dailyActivities.length === 0) {
            container.innerHTML = `<p>لا توجد أنشطة مضافة لهذا اليوم${date ? ' ('+date+')' : ''}</p>`;
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
                                body: JSON.stringify({ activityName: act.name, classId: classId, date: currentActivitiesDate })                            });

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
    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
        <i class="fa-solid fa-file" style="font-size: 20px; color :#e74c3c"></i>
        <div style="flex: 1;">
            <strong>${file.name}</strong><br/>
            <small style="color:  #6a9baeff; font-size: 13px; font-weight: bold; background: #f5faffff; padding: 2px 8px; border-radius: 12px; display: inline-block; margin: 3px 0;">${file.activity_name ? "ملف نشاط " + file.activity_name : "لا يتعلق بنشاط محدد"}</small>
            <br>
            <small>${file.description || "بدون وصف"}</small>
        </div>
    </div>
    <div class="file-actions">
        <a href=${file.path} class="download-btn" download>
            <i class="fas fa-download"></i>
            تحميل
        </a>
        <button class="fileDelete-btn">
            <i class="fas fa-trash"></i>
            حذف
        </button>
    </div>
`
            
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

    

    // إضافة نشاط مخصص
    const saveCustomActivityBtn = document.getElementById('saveCustomActivity');
if (saveCustomActivityBtn) {
  saveCustomActivityBtn.addEventListener('click', function () {
    const newActivity = document.getElementById('newActivityInput')?.value.trim() || '';
    if (newActivity) {
      addNewActivity(newActivity);
      const inputEl = document.getElementById('newActivityInput');
      if (inputEl) inputEl.value = '';
    }
  });
}
    // إضافة بعد دالة toggleActivityOptions:
// ========== إضافة نشاط مع اختيار تاريخ =============
const addActivityBtn = document.getElementById('addActivityBtn');
const addActivityForm = document.getElementById('addActivityForm');
const activityDateSelect = document.getElementById('activityDate');
const activityDesc = document.getElementById('activityDesc');
const cancelActivityBtn = document.getElementById('cancelActivityBtn');

// إظهار الفورم عند الضغط على زر إضافة نشاط
addActivityBtn.addEventListener('click', () => {
  addActivityForm.style.display = 'block';
  addActivityBtn.style.display = 'none';
  fillActivityDates();
  fillActivityOptions();
});

// إخفاء الفورم عند الضغط على إلغاء
cancelActivityBtn.addEventListener('click', () => {
  addActivityForm.style.display = 'none';
  addActivityBtn.style.display = 'inline-block';
  activityDesc.value = '';
  clearActivitySelection();
});
function fillActivityDates() {
  if (!activityDateSelect) return;
  activityDateSelect.innerHTML = '';
  const today = new Date();
  let addedCount = 0;
  for (let i = 0; i < 14 && addedCount < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const day = date.getDay(); // 0-6
    if (day === 5 || day === 6) continue; // تخطي الجمعة والسبت
    const iso = date.toISOString().split('T')[0];
    const option = document.createElement('option');
    option.value = iso;
    option.textContent = `${date.toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'2-digit',day:'2-digit'})} `;
    activityDateSelect.appendChild(option);
    addedCount++;
  }
  if (activityDateSelect.options.length > 0) activityDateSelect.selectedIndex = 0;
}
// توليد قائمة التواريخ (آخر 7 أيام بدون جمعة وسبت)
// بدلاً من activitiesDateInput
const engActsDay = document.getElementById('engActsDay');
const engActsMonth = document.getElementById('engActsMonth');
const engActsYear = document.getElementById('engActsYear');

showActivitiesByDateBtn.addEventListener('click', () => {
  activitiesByDateForm.style.display = 'block';
  showActivitiesByDateBtn.style.display = 'none';
  fillEngActsDateSelects();
});

cancelShowActivitiesBtn.addEventListener('click', () => {
  activitiesByDateForm.style.display = 'none';
  showActivitiesByDateBtn.style.display = 'inline-block';
});

showActivitiesBtn.addEventListener('click', async () => {
  const day = String(engActsDay.value).padStart(2, '0');
  const month = String(engActsMonth.value).padStart(2, '0');
  const year = engActsYear.value;
  const dateString = `${year}-${month}-${day}`;
  await loadTodayEnglishActivities(dateString);
  activitiesByDateForm.style.display = 'none';
  showActivitiesByDateBtn.style.display = 'inline-block';
});

function fillEngActsDateSelects() {
  // الأيام
  engActsDay.innerHTML = '';
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    engActsDay.appendChild(opt);
  }
  // الشهور
  engActsMonth.innerHTML = '';
  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  monthNames.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = idx + 1;
    opt.textContent = m;
    engActsMonth.appendChild(opt);
  });
  // السنوات
  engActsYear.innerHTML = '';
  const thisYear = new Date().getFullYear();
  [thisYear, thisYear - 1].forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    engActsYear.appendChild(opt);
  });
  // اليوم الحالي
  const today = new Date();
  engActsDay.value = today.getDate();
  engActsMonth.value = today.getMonth() + 1;
  engActsYear.value = today.getFullYear();
}

// ملء قائمة الأنشطة بالشكل الجديد
function fillActivityOptions() {
  const container = document.getElementById('activityOptions');
  container.innerHTML = '';
  
  if (typeof activities !== 'undefined' && Array.isArray(activities)) {
    activities.forEach(act => {
      const activityDiv = document.createElement('div');
      activityDiv.className = 'activity-option';
      activityDiv.style.cssText = `
        border: 2px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: white;
      `;
      
      activityDiv.innerHTML = `
        <i class="fas ${act.icon}" style="font-size: 24px; color: #e74c3c; margin-bottom: 8px; display: block;"></i>
        <span style="font-weight: bold; color: #333;">${act.name}</span>
      `;
      
      // إضافة تأثيرات عند التمرير
      activityDiv.addEventListener('mouseenter', () => {
        activityDiv.style.borderColor = '#e74c3c';
        activityDiv.style.backgroundColor = '#f8f9fa';
        activityDiv.style.transform = 'translateY(-2px)';
      });
      
      activityDiv.addEventListener('mouseleave', () => {
        activityDiv.style.borderColor = '#ddd';
        activityDiv.style.backgroundColor = 'white';
        activityDiv.style.transform = 'translateY(0)';
      });
      
      // عند النقر على النشاط
      activityDiv.addEventListener('click', async () => {
        // إزالة التحديد من جميع الأنشطة
        document.querySelectorAll('.activity-option').forEach(opt => {
          opt.style.borderColor = '#ddd';
          opt.style.backgroundColor = 'white';
        });
        
        // تحديد النشاط المختار
        activityDiv.style.borderColor = '#e74c3c';
        activityDiv.style.backgroundColor = '#e8f5e8';
        
        // إرسال النشاط
        await submitActivity(act.name);
      });
      
      container.appendChild(activityDiv);
    });
  }
}

// مسح تحديد الأنشطة
function clearActivitySelection() {
  document.querySelectorAll('.activity-option').forEach(opt => {
    opt.style.borderColor = '#ddd';
    opt.style.backgroundColor = 'white';
  });
}

// إرسال النشاط للسيرفر
async function submitActivity(activityName) {
    const description = activityDesc.value;
    const date = activityDateSelect.value;
    const get_class_id = document.getElementById("get_class_id");
    const classId = get_class_id.dataset.classId;
    
    try {
        const res = await fetch('/api/insertTodayEnglishDailyActivity',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityName, description, date, classId })
      });
    const data = await res.json();
    if (data.success) {
      alert('تمت إضافة النشاط بنجاح');
      addActivityForm.style.display = 'none';
      addActivityBtn.style.display = 'inline-block';
      activityDesc.value = '';
      clearActivitySelection();
      await loadTodayEnglishActivities();
    } else {
      alert('فشل الإضافة: ' + (data.message || '')); 
    }
  } catch (err) {
    alert('حدث خطأ أثناء الإضافة: ' + err.message);
  }
}

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
