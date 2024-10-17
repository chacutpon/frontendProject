import { configureStore } from '@reduxjs/toolkit'
import userSlice from './userSlice'

//ไฟล์นี้มีหน้าที่รวบรวม store
export const store = configureStore({
  reducer: { //ส่วนของการเรียกใช้ store
    user: userSlice
  },
})