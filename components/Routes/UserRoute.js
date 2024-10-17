import React, { useEffect, useState } from 'react'
//usedispatch ส่งเข้าไป ใน redux,use selector คือดึงออกมาใช้
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

//folder นี้มีไว้เพื่อเอาไว้เช็คว่า login แล้วหรือยังเพื่อที่จะไปหน้าของ user ต่างๆ
const UserRoute = ({children}) => { //ต้องเป็นชื่อ {children เท่านั้น}
const { user } = useSelector((state)=>({...state}))//เอา state จาก redux มา
console.log('hellorouteuser',user);
//children พูดง่ายๆคือตัว  <HomepageUser/> ที่อยู่ภายใน <UserRoute> 
    return user.user && user.user.token //checkว่า user(อันซ้ายก่อนจุดคือตัวแปลที่เรารับ)เข้าไปใน user ว่ามีข้อมูลไหม
    ? children //ถ้า true แสดง children(แสดง components ที่อยู่ข้างใน <HomepageUser/>)
    : (<h1>UserPermission</h1>) //false
}

export default UserRoute