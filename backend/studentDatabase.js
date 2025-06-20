import mysql from 'mysql2'
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



