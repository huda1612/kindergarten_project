//import mysql from 'mysql2'
import {executeQuery} from './database.js'

//مافي داعي نعمل بول لان عم نعمل كل الاستعلامات باستخدام التابع اللي مستوردينه من ملف قاعدة البيانات

//تابع يرد اسم الطالب من معرفه
export async function getStudentFullName(studentId) {
  const rows = await executeQuery('SELECT first_name , last_name FROM students where id = ? ', [studentId]  );
  if(rows.length === 0 )
    return "unknown" ; 
  return rows[0].first_name +" "+ rows[0].last_name  ; 
}

export async function getStudentNameWithNikname(studentId) {
  const rows = await executeQuery('SELECT gender FROM students where id = ? ', [studentId]  );
  const full_name =await getStudentFullName(studentId) ; 
  if(rows[0].gender== "male")
    return "الطالب" +" "+ full_name ;
  else 
    return "الطالبة" +" "+ full_name ;
}

//تابع لرد رقم الصف للطالب 
export async function getClassIdByStudentId(studentId) {
  const rows = await executeQuery(
      `SELECT class_id FROM students WHERE id = ? LIMIT 1`,
      [studentId]
    );
     if (rows.length === 0) {
      return null ; // ما لاقى صف للطالب
    }
    return rows[0].class_id;

}


export async function insertNote(studentId, content, date) {
  //اولا نحذف الملاحظة القديمة للطالب ان وجدت
  await executeQuery(`DELETE From notes WHERE student_id=?`,[studentId])
  const query = `INSERT INTO notes (student_id, content, date) VALUES (?, ?, ?)`;
  const params = [studentId, content, date];
  return await executeQuery(query, params);
}

export async function deleteNote(studentId, date) {
   await executeQuery(
          `DELETE FROM notes WHERE student_id = ? AND date = ?`,
          [studentId, date]
        );
}


export async function deleteAbsence(studentId, date) {
   await executeQuery(
          `DELETE FROM absences WHERE student_id = ? AND date = ?`,
          [studentId, date]
        );
}

//تابع لتسجيل غياب طالب لو كان مافي غياب اله بهاليوم بس
export async function insertAbsence(studentId, date) {
  // تحقق إذا الغياب موجود مسبقاً
  const checkQuery = `SELECT id FROM absences WHERE student_id = ? AND date = ?`;
  const existing = await executeQuery(checkQuery, [studentId, date]);
  
  if (existing.length === 0) {
    // إذا لا يوجد غياب، أضف سجل جديد
    const query = `INSERT INTO absences (student_id, date) VALUES (?, ?)`;
    return await executeQuery(query, [studentId, date]);
  }
  
  // إذا موجود بالفعل، لا نفعل شيء
  return null;
}

//تابع يرد اسم المعلم بناء رقم الطالب 
export async function getTeacherNameByStudentId(studentId) {
  const query = `
    SELECT t.first_name, t.last_name
    FROM teachers t
    JOIN classes c ON t.id = c.teacher_id
    JOIN students s ON s.class_id = c.id
    WHERE s.id = ?
    LIMIT 1
  `;

  try {
    const [result] = await executeQuery(query, [studentId]);
    return result ? `${result.first_name} ${result.last_name}` : null;
  } catch (error) {
    console.error('Error in getTeacherNameByStudentId:', error);
    throw error;
  }
}


//تابع لرد اسم الصف من رقم الطالب
export async function getClassNameByStudentId(studentId) {
  const query = `
    SELECT classes.class_name  
    FROM students 
    JOIN classes ON students.class_id = classes.id 
    WHERE students.id = ?
  `;
  const result = await executeQuery(query, [studentId]);
  return result[0]?.class_name || null;
}

//تابع يرد عدد مرات غياب طالب محدد
export async function getAbsenceCountByStudentId(studentId) {

    // هذا الاستعلام يحسب عدد الغيابات خلال السنة الدراسية الحالية
  // السنة الدراسية تبدأ من 1 أيلول وتنتهي في 31 آب من السنة التالية
  // إذا كنا بعد شهر أيلول => النطاق من 1 أيلول للسنة الحالية حتى 31 آب للسنة القادمة
  // إذا كنا قبل شهر أيلول => النطاق من 1 أيلول للسنة الماضية حتى 31 آب للسنة الحالية
  const result = await executeQuery(`
    SELECT COUNT(*) AS total_absences
    FROM absences
    WHERE student_id = ?
      AND date BETWEEN 
        (CASE 
           WHEN MONTH(CURDATE()) >= 9 
             THEN CONCAT(YEAR(CURDATE()), '-09-01')
           ELSE CONCAT(YEAR(CURDATE()) - 1, '-09-01')
         END)
        AND 
        (CASE 
           WHEN MONTH(CURDATE()) >= 9 
             THEN CONCAT(YEAR(CURDATE()) + 1, '-08-31')
           ELSE CONCAT(YEAR(CURDATE()), '-08-31')
         END)
  `, [studentId]);

  return result[0].total_absences;

  /*
  const result = await executeQuery(`
    SELECT COUNT(*) AS total_absences
    FROM absences
    WHERE student_id = ?
      AND date BETWEEN 
        (IF(MONTH(CURDATE()) >= 9, 
            CONCAT(YEAR(CURDATE()), '-09-01'),
            CONCAT(YEAR(CURDATE()) - 1, '-09-01')))
        AND 
        (IF(MONTH(CURDATE()) >= 9, 
            CONCAT(YEAR(CURDATE()) + 1, '-06-30'),
            CONCAT(YEAR(CURDATE()), '-06-30')))
  `, [studentId]);

  return result[0].total_absences;

  /*

  const rows = await executeQuery(
    `SELECT COUNT(*) AS absence_count FROM absences WHERE student_id = ?`,
    [studentId]
  );
  return rows[0]?.absence_count || 0;
  */
}

//تابع يرد ملاحظة اليوم لطالب محدد
export async function getTodayNoteByStudentId(studentId) {
  const query = `
    SELECT content 
    FROM notes 
    WHERE student_id = ? AND date = CURDATE()
    LIMIT 1
  `;
  const rows = await executeQuery(query, [studentId]);
  return rows[0]?.content || null;
}


export async function getNotesByStudentIdInDateRange(studentId, startDate, endDate) {
  const query = `
    SELECT 
      DATE(
        COALESCE(
          /* إذا كان الحقل نصيًا، جرّب صيغة YYYY-MM-DD ثم DD-MM-YYYY */
          STR_TO_DATE(date, '%Y-%m-%d'),
          STR_TO_DATE(date, '%d-%m-%Y'),
          /* في حال كان الحقل DATE أصلاً */
          date
        )
      ) AS date,
      content
    FROM notes
    WHERE student_id = ?
      AND DATE(
        COALESCE(
          STR_TO_DATE(date, '%Y-%m-%d'),
          STR_TO_DATE(date, '%d-%m-%Y'),
          date
        )
      ) BETWEEN ? AND ?
    ORDER BY date ASC
  `;
  const rows = await executeQuery(query, [studentId, startDate, endDate]);
  return rows;
}

