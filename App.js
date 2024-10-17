import "./App.css";
import Header from "./components/layouts/Header";

//Routerdom
import { BrowserRouter, Routes, Route } from "react-router-dom";

//checkuserlogin
//useeffectทำฉันก่อน,usedispatchส่งข้อมูลเข้าไปเก็บredux,useselectorเรียกใช้redux
import React,{ useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "./store/userSlice";
import { auth } from "./components/firebase"; //ดึงข้อมูลที่loginมาผ่านfirebase

//function
import { currentUser } from "./components/functions/authBackend";


//PagesUser
import HomepageUser from "./components/pages/User/HomepageUser";
import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
import WaitQuizGameStart from "./components/pages/User/WaitForTeacherPressStart";
import WaitGroupGame from "./components/pages/User/WaitGroupGame";


//PageTeacher
import ManageTeacher from "./components/pages/Teacher/ManageTeacher";
import Homes from "./components/pages/Teacher/Home";
import Create from "./components/pages/Teacher/Create";
import Points from "./components/pages/Teacher/Points";


//TeacherCreate
import CreateAskingGame from "./components/pages/Game/Asking/CreateAskingGame";
import CreateGroupGame from "./components/pages/Game/Group/CreateGroupGame";
import CreateQuizGame from "./components/pages/Game/Quiz/CreateQuizGame";
import PlayerScores from "./components/pages/Game/Asking/PlayerScores";


//playgame
import GamePlay from "./components/pages/Game/Quiz/GamePlay";
import GamePlayGroup from "./components/pages/Game/Group/GamePlayGroup";


//seepoint
import SeePointQuiz from "./components/pages/Game/Quiz/SeePointQuiz";
import SeeAnswerGroup from "./components/pages/Game/Group/SeeAnswerGroup";


//GamePin
import GamePinQuiz from "./components/pages/Game/Quiz/GamePinQuiz"
import GamePinGroup from "./components/pages/Game/Group/GamePinGroup"

//PageAdmin
import HomepageAdmin from "./components/pages/Admin/HomepageAdmin";

//Rule Routes
import UserRoute from "./components/Routes/UserRoute";
import AdminRoute from "./components/Routes/AdminRoute";
import TeacherRoute from "./components/Routes/TeacherRoute";

function App() {
  const dispatch = useDispatch()


  //เมื่อเริ่มมามีการใช้หน้าเว็บเพจจะติดตามการloginด้วยเมทอดonAuthStateChangedของfirebase
  // useEffect(()=>{
  //   const unsubScribe = auth.onAuthStateChanged(async(user)=>{
  //     if(user){
  //       const idToken = await user.getIdTokenResult()
        
  //       currentUser(idToken.token) //เรียกใช้ currentuser จากfunctionโดยเอส idToken
  //       .then((res)=>{
  //         console.log('res',res.data); //ส่งเข้าไปให้ redux จาก server
  //         dispatch(login({
  //           email: res.data.email,
  //           name: res.data.name,
  //           role: res.data.role,
  //           token: idToken.token
  //         }))
  //       })
  //       .catch((err)=>{
  //         console.log(err);        
  //       })
       
  //       // console.log('idToken',idToken.token);        
  //       // console.log('helllouseeffect',user.email);
       

  //       //ต่อไปเป็นการส่งไปเก็บใน redux
  //       dispatch(login({
  //         email: user.email,
  //         name: user.name,
  //         token: idToken.token
  //       })) //เรียกใช้แค่นี้เลย
  //     }
   
  //   })
    
  //   return ()=> unsubScribe()
// },[])//กันinfiniteloop
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const idTokenResult = await user.getIdTokenResult();
        const idToken = idTokenResult.token;
        localStorage.setItem('token', idToken);
        const res = await currentUser(idToken);
        console.log('res', res.data);
        dispatch(login({
          email: res.data.email,
          name: res.data.name,
          role: res.data.role,
          token: idToken
        }));
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    }
  });

  return () => unsubscribe();
}, []);


  return (
 
      <BrowserRouter>
      
      <Header/>
        <Routes>         
         
          <Route 
            path="/" 
            element={<Home/>}>
          </Route>
          
          <Route 
            path="/login" 
            element={<Login/>}>
          </Route>
          
          
          {/* ต้อง authen เท่านั้นข้างล่าง */}     

          {/* user*/}
          <Route
          path="/user/index"
          element={
            <UserRoute>
              <HomepageUser/>
            </UserRoute>
          }
        ></Route>
          <Route
          path="/user/index/wait-teacher"
          element={
            <UserRoute>
              <WaitQuizGameStart/>
            </UserRoute>
          }
        ></Route>
          <Route
          path="/user/index/wait-groupgame"
          element={
            <UserRoute>
              <WaitGroupGame/>
            </UserRoute>
          }
        ></Route>
          <Route
          path="/user/index/play-game"
          element={
            <UserRoute>
              <GamePlay/>
            </UserRoute>
          }
        ></Route>
          <Route
          path="/user/index/play-group-game"
          element={
            <UserRoute>
              <GamePlayGroup/>
            </UserRoute>
          }
        ></Route>
         

          {/* Teacher   */}
          <Route
          path="/teacher/index"
          element={
            <TeacherRoute>
              <Homes/>
            </TeacherRoute>
          }
        ></Route>
        <Route
          path="/teacher/manage-teacher"
          element={
            <TeacherRoute>
              <ManageTeacher />
            </TeacherRoute>
          }
        ></Route>  
       
        <Route
          path="/teacher/manage-teacher/points"
          element={
            <TeacherRoute>
              <Points />
            </TeacherRoute>
          }
        ></Route>  
        
        <Route
          path="/teacher/create"
          element={
            <TeacherRoute>
              <Create />
            </TeacherRoute>
          }
        ></Route>  
          
          {/* teachercreateaskinggame */}
          <Route
          path="/teacher/create/asking-game"
          element={
            <TeacherRoute>
              <CreateAskingGame />
            </TeacherRoute>
          }
        ></Route>  
        
        {/* teachergroupgame */}
        <Route
          path="/teacher/create/group-game"
          element={
            <TeacherRoute>
              <CreateGroupGame />
            </TeacherRoute>
          }
        ></Route>  
          <Route
          path="/teacher/create/group-game/game-pin"
          element={
            <TeacherRoute>
              <GamePinGroup />
            </TeacherRoute>
          }
        ></Route>  
          <Route
          path="/teacher/create/group-game/see-point"
          element={
            <TeacherRoute>
              <SeeAnswerGroup />
            </TeacherRoute>
          }
        ></Route> 
         
         
                
         {/* teacherquizgame */}
        <Route
          path="/teacher/create/quiz-game/see-point"
          element={
            <TeacherRoute>
              <SeePointQuiz />
            </TeacherRoute>
          }
        ></Route>  
        <Route
          path="/teacher/create/quiz-game"
          element={
            <TeacherRoute>
              <CreateQuizGame />
            </TeacherRoute>
          }
        ></Route>       
        <Route
          path="/teacher/create/quiz-game/game-pin"
          element={
            <TeacherRoute>
              <GamePinQuiz />
            </TeacherRoute>
          }
        ></Route>  




          {/* admin */}
          <Route
          path="/admin/index"
          element={
            <AdminRoute>
              <HomepageAdmin/>
            </AdminRoute>
          }
        ></Route>


       
       
        </Routes>
      </BrowserRouter>
   
  );
}

export default App;
