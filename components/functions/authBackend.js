//ให้หน้านี้เป็นตัวติดต่อ Backend 
//แยกหน้าออกมาเพื่อให้ไม่รกตาและง่ายต่อการเรียกใช้งานในหน้าอื่น

import axios from 'axios'

export const createAndUpdateUser = async(authtoken)=>{ //axiosส่งข้อมูล headers ที่เป็น authtoken ไปหลังบ้าน
    return axios.post(`${process.env.REACT_APP_API}/auth`,{}
        ,{
            headers: {
                authtoken
            }
        })
}


export const currentUser = async(authtoken)=>{ //axiosส่งข้อมูล headers ที่เป็น authtoken ไปหลังบ้าน
    return axios.post(`${process.env.REACT_APP_API}/current-user`,{}
        ,{
            headers: {
                authtoken
            }
        })
}

export const currentTeacher = async(authtoken)=>{ //axiosส่งข้อมูล headers ที่เป็น authtoken ไปหลังบ้าน
    return axios.post(`${process.env.REACT_APP_API}/current-teacher`,{}
        ,{
            headers: {
                authtoken
            }
        })
}

export const currentAdmin = async(authtoken)=>{ //axiosส่งข้อมูล headers ที่เป็น authtoken ไปหลังบ้าน
    return axios.post(`${process.env.REACT_APP_API}/current-admin`,{}
        ,{
            headers: {
                authtoken
            }
        })
}

export const listUserAdmin = async (authtoken) => 
    await axios.get(
      process.env.REACT_APP_API + "/users-admin",
      {
        headers: {
          authtoken,
        },
      }
    );
export const listUserTeacher = async (authtoken) => 
    await axios.get(
      process.env.REACT_APP_API + "/users-teacher",
      {
        headers: {
          authtoken,
        },
      }
    );


export const removeUser = async (authtoken,id) => 
    await axios.delete(
        process.env.REACT_APP_API + "/users/"+id,
            {
                headers: {
                    authtoken,
             },
        }
    );
  