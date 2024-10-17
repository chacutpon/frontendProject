import React from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

//firestore
import { getFirestore, doc, setDoc } from "firebase/firestore";

//firebase
import { auth,db,googleAuthProvider } from '../firebase'

//redux 
import { useSelector,useDispatch } from 'react-redux'
import { login, logout } from '../../store/userSlice'

//axios คือการติดต่อจากฝั่งหน้าบ้านไปหลังบ้าน
import { createAndUpdateUser } from '../functions/authBackend'

import './Home.css'
import test2 from './image/test2.jpg'
const Login = () => {

//usedispatch ส่งเข้าไป ใน redux,use selector คือดึงออกมาใช้
const { user } = useSelector((state)=>({...state}))  
const dispatch = useDispatch()
const navigate = useNavigate()

console.log(user);

const savePlayerData = async (email, name) => {
    try {
        const playerRef = doc(db, "players", email); // ใช้อีเมลเป็น Document ID
        await setDoc(playerRef, {
            name: name,
            email: email,
            createdAt: new Date() // บันทึกเวลาที่สร้าง
        });
        console.log("Player data saved successfully.");
    } catch (error) {
        console.error("Error saving player data: ", error);
    }
};

const roleBaseRedirect = (role) =>{
  
   if(role === 'user' ){
        navigate('/user/index')
    }else if(role === 'teacher' ){
        navigate('/teacher/index')
    }else{
        navigate('/admin/index')
    }
}


const handleLoginGoogle = () => {
    auth.signInWithPopup(googleAuthProvider)
    .then(async (result) => {
        const { user } = result;
        const idToken = await user.getIdTokenResult();

        createAndUpdateUser(idToken.token)
        .then(async (res) => {
            // บันทึกข้อมูลใน Firestore
            await savePlayerData(user.email, res.data.name);

            // ส่งข้อมูลไปยัง Redux
            dispatch(login({
                email: res.data.email,
                name: res.data.name,
                role: res.data.role,
                token: idToken.token
            }));
            localStorage.setItem('token', idToken.token);
            roleBaseRedirect(res.data.role);
        })
        .catch((err) => {
            console.log(err);
        });
    })
    .catch((err) => {
        console.log(err);
    });
};

  return (
    
    <div 
        style={{
            backgroundImage: `url(${test2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }} 
    >
        <div className="login-container p-5 shadow" style={{ 
            backgroundColor: 'rgba(246, 148, 81, 0.8)', // เพิ่มความโปร่งแสงให้พื้นหลัง
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
            width: '400px', 
            borderRadius: '60px' // กำหนดให้กรอบโค้ง
        }}>
            <h1 className="text-center mb-4" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Login Page</h1> 
            <Button variant="primary" onClick={handleLoginGoogle} className="w-100 mb-3" style={{ 
                borderRadius: '25px', 
                padding: '12px 20px',
                fontSize: '16px' 
            }}>
                <i className="bi bi-google"></i>
                Sign In with Google
            </Button>
        </div>
    </div>
  )
}

export default Login