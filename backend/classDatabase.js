import { executeQuery } from './database.js';

//بجيب كل الصفوف
export async function getAllClasses() {
  return await executeQuery(`
    SELECT c.id, c.class_name, c.grade_level_id, 
           COUNT(s.id) AS student_count
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    GROUP BY c.id, c.class_name, c.grade_level_id
    ORDER BY c.class_name
  `);
}

// دالة جلب أعلى مستوى دراسي
export async function getMaxGradeLevel() {
  const result = await executeQuery('SELECT MAX(id) AS maxLevel FROM grade_levels');
  return result[0]?.maxLevel || 0;
}

// دالة جلب معلومات الصف (مثلاً grade_level_id)
export async function getClassInfo(classId) {
  const res = await executeQuery(
    `SELECT c.class_name, c.grade_level_id, g.name AS grade_level_name
     FROM classes c
     LEFT JOIN grade_levels g ON c.grade_level_id = g.id
     WHERE c.id = ?`,
    [classId]
  );
  return res[0];
}


// استعلام الطلاب حسب  رقم الصف
export async function getStudentsByClass(classId) {
  const rows = await executeQuery(`
    SELECT students.id, students.first_name, students.last_name, DATE(students.birth_date) AS birth_date, students.gender
    FROM students
    JOIN classes ON students.class_id = classes.id
    WHERE students.class_id = ?
  `, [classId]);

  const formattedRows = rows.map(row => ({
    ...row,
    birth_date: row.birth_date instanceof Date
      ? row.birth_date.toISOString().split('T')[0]
      : row.birth_date
  }));

  return formattedRows;
}


//حذف طالب
export async function deleteStudent(studentId) {
  try {
    //جلب حساب الطالب
    const studentRow = await executeQuery(`SELECT user_id FROM students WHERE id = ?`, [studentId]);
    if (studentRow.length === 0) {
      return { success: false, message: 'الطالب غير موجود' };
    }
    const userId = studentRow[0].user_id;

    // حذف حساب الطالب (إن وجد)
    if (userId) {
      await executeQuery(`DELETE FROM users WHERE id = ?`, [userId]);
      console.log("تم حذف حساب الطالب");
    }

    // جلب أولياء الأمور (ممكن أكثر من واحد)
    const guardianRows = await executeQuery(`SELECT guardian_id FROM guardians_students WHERE student_id = ?`, [studentId]);

    //حذف العلاقة بين الطالب وأولياء الأمور
    await executeQuery(`DELETE FROM guardians_students WHERE student_id = ?`, [studentId]);
    console.log("تم حذف العلاقة بين الطالب وأولياء الأمور");

    // لكل ولي أمر: إذا ما عنده أولاد غير الطالب، نحذفه
    for (const row of guardianRows) {
      const guardianId = row.guardian_id;
      if (!guardianId) continue;

      const countRows = await executeQuery(`SELECT COUNT(*) AS count FROM guardians_students WHERE guardian_id = ?`, [guardianId]);
      const childrenCount = countRows[0].count;

      if (childrenCount === 0) {
        await executeQuery(`DELETE FROM guardians WHERE id = ?`, [guardianId]);
        console.log(`تم حذف ولي الأمر رقم ${guardianId}`);
      }
    }

    // حذف الطالب نفسه
    await executeQuery(`DELETE FROM students WHERE id = ?`, [studentId]);
    console.log("تم حذف الطالب");

    return { success: true, message: 'تم حذف الطالب وكل البيانات المرتبطة به بنجاح' };

  } catch (err) {
    console.error("خطأ أثناء حذف الطالب:", err);
    return { success: false, message: 'حدث خطأ أثناء حذف الطالب' };
  }
}





// اضافة طالب
export async function addStudent(studentData) {
  const { first_name, last_name, birth_date, gender, class_id , user_id } = studentData;

  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/; // يقبل الحروف العربية والانجليزية ومسافات فقط

  // تحقق من صحة الأسماء
  if (
    typeof first_name !== 'string' ||
    typeof last_name !== 'string' ||
    first_name.trim() === '' ||
    last_name.trim() === '' ||
    !nameRegex.test(first_name) ||
    !nameRegex.test(last_name)
  ) {
    return { success: false, message: "الاسم الأول أو الأخير غير صالح" };
  }

  // تحقق من تاريخ الميلاد
  if (!birth_date || isNaN(Date.parse(birth_date))) {
    return { success: false, message: "تاريخ الميلاد غير صالح" };
  }

  // تحقق من الجنس
  let genderValue;
  if (gender === 'ذكر' || gender === 'male') {
    genderValue = 'male';
  } else if (gender === 'أنثى' || gender === 'female') {
    genderValue = 'female';
  } else {
    return { success: false, message: "الجنس يجب أن يكون ذكر أو أنثى" };
  }

  // تحقق من الصف
  if (!class_id || isNaN(class_id)) {
    return { success: false, message: "الصف غير صالح" };
  }

  try {
    // تحقق من وجود الصف
    const classCheck = await executeQuery(`SELECT id FROM classes WHERE id = ?`, [class_id]);
    if (classCheck.length === 0) {
      return { success: false, message: "الصف غير موجود" };
    }
    
        // تحقق من عدد الطلاب الحاليين بالصف
        const maxStudents = 35; // حطينا الحد للطلاب بالصف الواحد هو 35 طالب
        const studentCount = await executeQuery(
          `SELECT COUNT(*) AS count FROM students WHERE class_id = ?`,
          [class_id]
        );
    
        if (studentCount[0].count >= maxStudents) {
          return { success: false, message: "❌ الصف ممتلئ، لا يمكن إضافة طالب جديد" };
        }
    
    // تحقق من وجود طالب بنفس الاسم والكنية وتاريخ الميلاد والصف
    const existingStudent = await executeQuery(`
      SELECT id FROM students
      WHERE first_name = ? AND last_name = ? AND birth_date = ? AND class_id = ?
    `, [first_name.trim(), last_name.trim(), birth_date, class_id]);

    if (existingStudent.length > 0) {
      return { success: false, message: "طالب بنفس المعلومات موجود مسبقًا" };
    }

    // إدخال الطالب
    const insertResult = await executeQuery(
      `INSERT INTO students (first_name, last_name, birth_date, gender, class_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name.trim(), last_name.trim(), birth_date, genderValue, class_id, user_id]
    );

    return { success: true, message: "تم إضافة الطالب بنجاح", studentId: insertResult.insertId };
  } catch (err) {
    console.error("خطأ في إضافة الطالب:", err);
    return { success: false, message: "حدث خطأ أثناء إضافة الطالب" };
  }
}



// نقل طالب من صف إلى صف آخر
export async function transferStudentToClass(student_id, new_class_id) {
  // تحقق من صحة المعطيات
  if (!student_id || isNaN(student_id)) {
    return { success: false, message: "رقم الطالب غير صالح" };
  }

  if (!new_class_id || isNaN(new_class_id)) {
    return { success: false, message: "رقم الصف الجديد غير صالح" };
  }

  try {
    // تحقق من وجود الطالب
    const studentCheck = await executeQuery(`SELECT * FROM students WHERE id = ?`, [student_id]);
    if (studentCheck.length === 0) {
      return { success: false, message: "الطالب غير موجود" };
    }

    const student = studentCheck[0];

    // تحقق من أن الصف الجديد مختلف عن الصف الحالي
    if (student.class_id == new_class_id) {
      return { success: false, message: "الطالب موجود بالفعل في هذا الصف" };
    }

    // جلب الصف الحالي والجديد مع مستوى كل منهما
    const classLevelsCheck = await executeQuery(
      `SELECT id, grade_level_id FROM classes WHERE id IN (?, ?)`,
      [student.class_id, new_class_id]
    );
    
    if (classLevelsCheck.length < 2) {
      return { success: false, message: "الصف الحالي أو الجديد غير موجود" };
    }

    const currentClass = classLevelsCheck.find(c => c.id == student.class_id);
    const newClass = classLevelsCheck.find(c => c.id == new_class_id);

    console.log({ currentClass, newClass }); // للتأكد من القيم


    if (!currentClass || !newClass) {
      return { success: false, message: "تعذر التحقق من المستويات الدراسية" };
    }

    if (currentClass.grade_level_id !== newClass.grade_level_id) {
      return {
        success: false,
        message: `لا يمكن نقل الطالب بين مستويات مختلفة (الحالي: ${currentClass.grade_level_id}، الجديد: ${newClass.grade_level_id})`
      };
    }

    // تحقق من عدم وجود طالب بنفس الاسم والكنية وتاريخ الميلاد في الصف الجديد
    const duplicateCheck = await executeQuery(
      `SELECT id FROM students
       WHERE first_name = ? AND last_name = ? AND birth_date = ? AND class_id = ?`,
      [student.first_name.trim(), student.last_name.trim(), student.birth_date, new_class_id]
    );

    if (duplicateCheck.length > 0) {
      return { success: false, message: "طالب بنفس المعلومات موجود مسبقًا في الصف الجديد" };
    }

    // ✅ تحقق من عدد الطلاب في الصف الجديد
    const maxStudents = 35; // حطي العدد اللي بدك ياه
    const studentCount = await executeQuery(
      `SELECT COUNT(*) AS count FROM students WHERE class_id = ?`,
      [new_class_id]
    );

    if (studentCount[0].count >= maxStudents) {
      return { success: false, message: "❌ الصف الجديد ممتلئ، لا يمكن نقل الطالب إليه" };
    }


    // نفّذ عملية النقل
    await executeQuery(`UPDATE students SET class_id = ? WHERE id = ?`, [new_class_id, student_id]);

    return { success: true, message: "تم نقل الطالب بنجاح إلى الصف الجديد" };
  } catch (err) {
    console.error("خطأ في نقل الطالب:", err);
    return { success: false, message: "حدث خطأ أثناء نقل الطالب" };
  }
}




//تعديل بيانات طالب
export async function updateStudent(studentId, updateData) {
  // تحقق من صلاحية studentId
  if (!studentId || isNaN(studentId)) {
    return { success: false, message: "studentId غير صالح" };
  }

  // تحقق من وجود الطالب أولاً
  const checkSql = `SELECT id FROM students WHERE id = ?`;
  const checkResult = await executeQuery(checkSql, [studentId]);
  if (checkResult.length === 0) {
    return { success: false, message: "الطالب غير موجود" };
  }

  // التحقق من القيم المُدخلة
  const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/; // حروف عربية وانجليزية ومسافات فقط
  const genderOptions = ['male', 'female'];

  const { first_name, last_name, birth_date, gender, class_id } = updateData;

  if (typeof first_name !== 'string' || first_name.trim() === '' || !nameRegex.test(first_name)) {
    return { success: false, message: "الاسم الأول غير صالح" };
  }

  if (typeof last_name !== 'string' || last_name.trim() === '' || !nameRegex.test(last_name)) {
    return { success: false, message: "اسم العائلة غير صالح" };
  }

  if (!birth_date || isNaN(new Date(birth_date).getTime())) {
    return { success: false, message: "تاريخ الميلاد غير صالح" };
  }

  if (!genderOptions.includes(gender)) {
    return { success: false, message: "الجنس يجب أن يكون 'ذكر' أو 'انثى'" };
  }

  if (!class_id || isNaN(class_id)) {
    return { success: false, message: "رقم الصف غير صالح" };
  }

  // تنفيذ التحديث
  const sql = `
    UPDATE students 
    SET first_name = ?, last_name = ?, birth_date = ?, gender = ?, class_id = ?
    WHERE id = ?
  `;

  await executeQuery(sql, [first_name.trim(), last_name.trim(), birth_date, gender, class_id,studentId ]);

  return { success: true, message: "تم تحديث بيانات الطالب بنجاح" };
}

//ترقية الصف
export async function promoteEntireClass(class_id) {
  try {
    // الحصول على الصف الحالي ومستوى الدراسة
    const currentClassRes = await executeQuery(
      `SELECT id, grade_level_id FROM classes WHERE id = ?`,
      [class_id]
    );

    if (currentClassRes.length === 0) {
      return { success: false, message: "الصف غير موجود" };
    }

    const currentClass = currentClassRes[0];

    // التحقق من وجود مستوى أعلى
    const nextLevelRes = await executeQuery(
      `SELECT id FROM grade_levels WHERE id = ?`,
      [currentClass.grade_level_id + 1]
    );

    if (nextLevelRes.length === 0) {
      const studentsInClass = await executeQuery(`SELECT id FROM students WHERE class_id = ?`, [class_id]);
      for (const student of studentsInClass) {
        await deleteStudent(student.id);
      }
      await executeQuery(`DELETE FROM classes WHERE id = ?`, [class_id]);
      return { success: true, message: "تم تخريج الصف بنجاح وحذف جميع الطلاب المرتبطين به." };
    }

    // تحديث مستوى الصف نفسه
    await executeQuery(
      `UPDATE classes SET grade_level_id = ? WHERE id = ?`,
      [currentClass.grade_level_id + 1, class_id]
    );

    return { success: true, message: "تم ترقية الصف إلى المستوى الأعلى" };

  } catch (err) {
    console.error("خطأ في ترقية الصف:", err);
    return { success: false, message: "حدث خطأ أثناء ترقية الصف" };
  }
}

// جلب قائمة أولياء الأمور لإضافتهم في نموذج إضافة الطالب
export async function getGuardiansForStudentForm() {
  const result = await executeQuery(`
    SELECT 
      g.id,
      g.first_name,
      g.last_name,
      g.phone,
      COUNT(gs.student_id) as children_count
    FROM guardians g
    LEFT JOIN guardians_students gs ON g.id = gs.guardian_id
    GROUP BY g.id, g.first_name, g.last_name, g.phone
    ORDER BY g.first_name, g.last_name
  `);
  return result;
}
export async function addExperience(classId, experienceName) {
  try {
    const result = await executeQuery(
      `INSERT INTO class_experience (class_id, experience_name) VALUES (?, ?)`,
      [classId, experienceName]
    );
    return { success: true, message: "تم إضافة الخبرة بنجاح", experienceId: result.insertId };
  } catch (err) {
    console.error("خطأ في إضافة الخبرة:", err);
    return { success: false, message: "حدث خطأ أثناء إضافة الخبرة" };
  }
}

export async function getExperienceByClassId(classId) {
  try {
    const result = await executeQuery(
      `SELECT id, experience_name FROM class_experience WHERE class_id = ? ORDER BY id DESC LIMIT 1`,
      [classId]
    );
    return result[0] || null; // Returns the latest experience or null if not found
  } catch (err) {
    console.error("خطأ في جلب الخبرة:", err);
    return null;
  }
}

export async function updateExperience(experienceId, experienceName) {
  try {
    await executeQuery(
      `UPDATE class_experience SET experience_name = ? WHERE id = ?`,
      [experienceName, experienceId]
    );
    return { success: true, message: "تم تحديث الخبرة بنجاح" };
  } catch (err) {
    console.error("خطأ في تحديث الخبرة:", err);
    return { success: false, message: "حدث خطأ أثناء تحديث الخبرة" };
  }
}

export async function deleteExperience(experienceId) {
  try {
    await executeQuery(
      `DELETE FROM class_experience WHERE id = ?`,
      [experienceId]
    );
    return { success: true, message: "تم حذف الخبرة بنجاح" };
  } catch (err) {
    console.error("خطأ في حذف الخبرة:", err);
    return { success: false, message: "حدث خطأ أثناء حذف الخبرة" };
  }
}
