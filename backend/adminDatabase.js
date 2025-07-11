import {executeQuery} from './database.js'

//تابع يرد بيانات جميع المعلمين بالروضة 
//لكل معلم {id :... , first_name :... , last_name :...  , class_name: .... , phone:.... }
export async function getAllTeachersData() {
    //برد كل المعلمين حتى لو ما عندهم صف محدد ممكن اسم الصف يكون null
    const result = await executeQuery(`
        SELECT t.id, t.first_name, t.last_name, t.phone, c.class_name
        FROM teachers t
        LEFT JOIN classes c ON t.id = c.teacher_id
        `)
    return result ; 
}

export async function insertTeacher(first_name , last_name , phone){
     return await executeQuery(`
      INSERT INTO teachers (first_name , last_name , phone)
      VALUES (?, ?, ?) `, [first_name , last_name , phone]);
}