import React, { useEffect, useState } from 'react'
import { currentTeacher } from '../functions/authBackend'
import { useSelector } from 'react-redux'



const TeacherRoute = ({children}) => {
    const {user} = useSelector((state)=>({...state})) 
    const [ok,setOk] = useState(false) //เริ่มมาตั้งต่าให้เป็น false(ไม่ใช่ role teacher)

    useEffect(()=>{ //มาถึงทำฉันก่อน

        if(user && user.user && user.user.token){
          currentTeacher(user.user.token)
          .then(res=>{
           
            console.log(res);
            setOk(true)//(เมื่อผ่านเงื่อนไขให้เป็น true)
          }).catch(err=>{
          
            console.log(err);
            setOk(false)
          })
        }

        
    },[user])




  return ok
  ? children //ถ้า true แสดง children(แสดง components ที่อยู่ข้างใน <HomepageUser/>)
  : (<h1>TeacherPermission</h1>) //false
}

export default TeacherRoute