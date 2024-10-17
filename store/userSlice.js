import { createSlice } from '@reduxjs/toolkit'
//เอาไว้เก็บข้อมูล

const initialState = {
  value: 2,
  user: null,
}
//stateคือตัวแปรเข้าถึงตัวconst initialStateส่วน.userคือเข้าถึงตัวuserในstate 
export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    login: (state , action) => {
      state.value = 'Login'
      state.user = action.payload 
    },
    logout: (state) => {
      state.user = null//[] คือ ค่าเริ่มต้นซึ่งในที่นี่คือเมื่อกด logout คือหายหมดเป็นเริ่มต้น
      localStorage.removeItem('token'); 
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
  },
})


// Action creators are generated for each case reducer function
export const { login, logout, incrementByAmount } = userSlice.actions

export default userSlice.reducer
