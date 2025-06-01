import mysql from 'mysql2'
import bcrypt from 'bcrypt' 

const pool = mysql.createPool({
  host: '127.0.0.1' ,
  user: 'root',
  password: '1234',
  database: 'kindergarten'
  
}).promise();

export async function authentication( username , password ){
    
    const [result] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    //check the username 
    if(result.length == 0){
        return false; 
    }

    else {    
    const user = result[0];
    const match = await bcrypt.compare(password, user.password);
    //check the password 
    if(!match){
        return false;
    }
    else{
       return user ;
    }

    }

}



export async function getUsers() {
    const [rows] = await pool.query('select * from users');
    return rows ;
}



