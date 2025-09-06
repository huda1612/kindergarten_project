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

// تفعيل عنصر القائمة الجانبية
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
  item.addEventListener('click', function() {
    menuItems.forEach(i => i.classList.remove('active'));
    this.classList.add('active');
  });
});


async function loadStudentActivities(date = null) {
  try {
    let url = '/api/getTodayActivityList';
    if (date) url += `?date=${date}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('فشل في تحميل أنشطة اليوم');

    const data = await response.json();
const mainActivities = data.dailyActivitiesMain || [];
const englishActivities = data.dailyActivitiesEnglish || [];
const container = document.getElementById('todayActivities');
if (!container) return;
container.innerHTML = '';

currentActivitiesDate = date || new Date().toISOString().split('T')[0];

const totalCount = mainActivities.length + englishActivities.length;
if (totalCount === 0) {
      const dayIdx = new Date(currentActivitiesDate).getDay(); // 0-6, 5=Friday, 6=Saturday
      if (dayIdx === 5 || dayIdx === 6) {
        container.innerHTML = `<p>عطلة سعيدة، لا يوجد أنشطة اليوم</p>`;
        return;
      }
      container.innerHTML = `<p>لا توجد أنشطة مضافة لهذا اليوم${date ? ' ('+date+')' : ''}</p>`;
      return;
    }

    if (mainActivities.length > 0) {
      const h = document.createElement('h4');
      h.textContent = 'أنشطة رئيسية';
      container.appendChild(h);
      mainActivities.forEach(renderAct);
    }
    
    if (englishActivities.length > 0) {
      const h2 = document.createElement('h4');
      h2.textContent = 'أنشطة إنكليزية';
      container.appendChild(h2);
      englishActivities.forEach((a)=>renderAct(a, true));
    }
  } catch (err) {
    console.error(err);
    const container = document.getElementById('todayActivities');
    if (container) container.innerHTML = '<p>خطأ في تحميل أنشطة اليوم</p>';
  }
}

function previousSpecificWeekday(dateString, weekdayIndex) {
  const d = new Date(dateString);
  if (isNaN(d)) return null;
  const current = d.getDay();
  let diff = (current - weekdayIndex + 7) % 7;
  if (diff === 0) diff = 7; // لو نفس اليوم، ارجع أسبوع
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

async function loadWeeklyNotes() {
  try {
    const res = await fetch('/api/student/weekly-notes');
    if (!res.ok) throw new Error('فشل في تحميل ملاحظات الأسبوع');
    const data = await res.json();
    const days = Array.isArray(data.days) ? data.days : [];

    const tableBody = document.getElementById('weekly-notes-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    days.forEach(({ date, content }) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
        <td>${content ? content : 'لا يوجد ملاحظة'}</td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    const tableBody = document.getElementById('weekly-notes-body');
    if (tableBody) tableBody.innerHTML = '<tr><td colspan="2">خطأ في تحميل الملاحظات</td></tr>';
  }
}
const showActivitiesByDateBtn = document.getElementById('showActivitiesByDateBtn');
const activitiesByDateForm = document.getElementById('activitiesByDateForm');
const showActivitiesBtn = document.getElementById('showActivitiesBtn');
const cancelShowActivitiesBtn = document.getElementById('cancelShowActivitiesBtn');
const actsDay = document.getElementById('actsDay');
const actsMonth = document.getElementById('actsMonth');
const actsYear = document.getElementById('actsYear');

function fillActsDateSelects() {
  if (!actsDay || !actsMonth || !actsYear) return;
  actsDay.innerHTML = '';
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    actsDay.appendChild(opt);
  }
  actsMonth.innerHTML = '';
  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  monthNames.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = idx + 1;
    opt.textContent = m;
    actsMonth.appendChild(opt);
  });
  actsYear.innerHTML = '';
  const thisYear = new Date().getFullYear();
  [thisYear, thisYear - 1].forEach(y => {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    actsYear.appendChild(opt);
  });
  const today = new Date();
  actsDay.value = today.getDate();
  actsMonth.value = today.getMonth() + 1;
  actsYear.value = today.getFullYear();
}

if (showActivitiesByDateBtn && activitiesByDateForm) {
  showActivitiesByDateBtn.addEventListener('click', () => {
    activitiesByDateForm.style.display = 'block';
    showActivitiesByDateBtn.style.display = 'none';
    fillActsDateSelects();
  });
}

if (cancelShowActivitiesBtn && activitiesByDateForm && showActivitiesByDateBtn) {
  cancelShowActivitiesBtn.addEventListener('click', () => {
    activitiesByDateForm.style.display = 'none';
    showActivitiesByDateBtn.style.display = 'inline-block';
  });
}

if (showActivitiesBtn) {
  showActivitiesBtn.addEventListener('click', async () => {
    const day = String(actsDay.value).padStart(2, '0');
    const month = String(actsMonth.value).padStart(2, '0');
    const year = actsYear.value;
    const dateString = `${year}-${month}-${day}`;
    await loadStudentActivities(dateString);
    activitiesByDateForm.style.display = 'none';
    showActivitiesByDateBtn.style.display = 'inline-block';
  });
}

function renderAct(act, isEnglish = false) {
  const container = document.getElementById('todayActivities');
  if (!container) return;
  const div = document.createElement('div');
  div.classList.add('activity-item');
  if (isEnglish) div.classList.add('english-activity');
  div.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
      <i class="fas ${act.icon}" style="font-size: 20px; color :${isEnglish ? '#2980b9' : '#e74c3c'}"></i>
      <div style="flex: 1;">
        <strong style="font-size: 16px; color: #2c3e50;">${act.name}</strong><br/>
        <small style="color: ${isEnglish ? '#2980b9' : '#ff6666'}; font-size: 13px; font-weight: bold; background: ${isEnglish ? '#e3f2fd' : '#fff5f5'}; padding: 2px 8px; border-radius: 12px; display: inline-block; margin: 3px 0;">${act.category || 'بدون تصنيف'}</small><br/>
        <small style="color: #272d2dff; font-size: 13px; margin-top: 5px; display: block;">${act.description || 'بدون وصف'}</small>

      </div>
    </div>
  `;
  container.appendChild(div);
}

//****************************file section ******************************

const fileDatebtn = document.getElementById('fileDatebtn');
const fileDateForm = document.getElementById('fileDateForm');
const cencelDateSelectFilebtn = document.getElementById('cencelDateSelectFilebtn');
const dateSelectFilebtn = document.getElementById('dateSelectFilebtn');

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
     const dailyFiles = data.flies || [];

     const container = document.getElementById("todayFiles");
     container.innerHTML = "";
        
    if (dailyFiles.length === 0) {
      container.innerHTML = `<p>لا توجد ملفات مضافة لهذا اليوم ${date}</p>`;
      return;
    }

    let mainFiles = dailyFiles.filter(files => files.type ==='main') ;
    let englishFiles = dailyFiles.filter(files => files.type ==='english') ;
    
    //عرض الملفات الرئيسية
    if(mainFiles.length > 0 ){
    const title = document.createElement("h4");
    title.innerHTML = "ملفات رئيسية";
    container.appendChild(title);

    //const br = document.createElement("br");
    //container.appendChild(br);

    mainFiles.forEach((file) => {
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

    </div>
`
             div.innerHTML = html;



            container.appendChild(div);
        });
    }
    
    //عرض ملفات الإنجليزي
    if(englishFiles.length > 0 ){
    const title = document.createElement("h4");
    title.innerHTML = "ملفات الإنجليزي";
    container.appendChild(title);

    //const br = document.createElement("br");
    //container.appendChild(br);

    englishFiles.forEach((file) => {
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

    </div>
`
             div.innerHTML = html;



            container.appendChild(div);
        });
    }
            
    }catch(err){
        console.error(err);
        document.getElementById("todayFiles").innerHTML =
            "<p>خطأ في تحميل ملفات اليوم</p>";
    }}

    
    
//******************************************************************************** */

// تحميل تلقائي عند فتح الصفحة
window.addEventListener('DOMContentLoaded', async () => {
  await loadStudentActivities();
  await loadWeeklyNotes();
  const today = new Date().toISOString().split('T')[0]; // يعطي "2025-07-18"
  await loadFiles(today);
});


