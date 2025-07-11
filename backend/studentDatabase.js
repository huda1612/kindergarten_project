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


//تابع لاضافة ملاحظه جديده عن الطالب 
export async function insertNote(studentId, content, date) {
  const query = `INSERT INTO notes (student_id, content, date) VALUES (?, ?, ?)`;
  const params = [studentId, content, date];
  return await executeQuery(query, params);
}

//تابع لتسجيل غياب طالب
export async function insertAbsence(studentId, date) {
  const query = `INSERT INTO absences (student_id, date) VALUES (?, ?)`;
  const params = [studentId, date];
  return await executeQuery(query, params);
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
  const rows = await executeQuery(
    `SELECT COUNT(*) AS absence_count FROM absences WHERE student_id = ?`,
    [studentId]
  );
  return rows[0]?.absence_count || 0;
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

