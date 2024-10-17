
import React, { useEffect, useState } from 'react'
import { currentAdmin } from '../functions/authBackend'
import { useSelector } from 'react-redux'


const AdminRoute = ({children}) => {
  const {user} = useSelector((state)=>({...state}))
  const [ok,setOk] = useState(false)

  useEffect(()=>{
      if (user && user.user && user.user.token) {
          currentAdmin(user.user.token)
              .then(res => {
                console.log(res);
                  setOk(true);
              })
              .catch(err => {
                console.log(err);
                setOk(false)
              });
      }
  }, [user]);

  return ok
    ? children //ถ้า true แสดง children(แสดง components ที่อยู่ข้างใน <HomepageUser/>)
    : (<h1>TeacherPermission</h1>) //false

}

export default AdminRoute