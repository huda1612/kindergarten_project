import {getClassIdByTeacherId} from './teacherDatabase.js'
import {getClassIdByStudentId} from './studentDatabase.js'


export async function getClassIdFromSession(sessionUser) {
  if (!sessionUser) return null;

  if (sessionUser.role === 'teacher') {
    if (!sessionUser.teacher_id) return null;
    return await getClassIdByTeacherId(sessionUser.teacher_id);
  }

  if (sessionUser.role === 'student') {
    if (!sessionUser.student_id) return null;
    return await getClassIdByStudentId(sessionUser.student_id);
  }

  return null; // دور غير معروف
}