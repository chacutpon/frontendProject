import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
} from "@mui/material";

const HomepageUser = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const createAt = new Date();
  const navigate = useNavigate();
  const quizGamesCollection = collection(db, "quiz_games");
  const gamePlayersCollection = collection(db, "game_players");
  const groupGamesCollection = collection(db, "group_games");
  const groupPlayersCollection = collection(db, "group_players");
  const location = useLocation();

  useEffect(() => {
    const preventGoBack = () => {
      window.history.pushState(null, null, location.pathname);
    };

    window.addEventListener('popstate', preventGoBack);
    window.history.pushState(null, null, location.pathname);

    return () => {
      window.removeEventListener('popstate', preventGoBack);
    };
  }, [location]);

  const joinRoom = async () => {
    console.log("Joining game with name:", name, "and pin:", pin);
    
    try {
      const quizQuery = query(quizGamesCollection, where("pin", "==", pin));
      const groupQuery = query(groupGamesCollection, where("pin", "==", pin));
  
      const [quizSnapshot, groupSnapshot] = await Promise.all([
        getDocs(quizQuery),
        getDocs(groupQuery),
      ]);
  
      if (!quizSnapshot.empty) {
        // เข้าร่วม quiz game
        const gameData = quizSnapshot.docs[0].data();
  
        if (gameData.gameStarted) {
          alert("เกมได้เริ่มไปแล้ว ไม่สามารถเข้าร่วมได้");
          return;
        }
  
        const gameSection = gameData.section;
        const nameQuery = query(
          gamePlayersCollection,
          where("pin", "==", pin),
          where("name", "==", name)
        );
        const nameSnapshot = await getDocs(nameQuery);
  
        if (nameSnapshot.empty) {
          // ตรวจสอบว่าเซคตรงกันหรือไม่
          const playerSnapshot = await getDocs(query(gamePlayersCollection, where("userEmail", "==", auth.currentUser.email)));
  
          if (playerSnapshot.empty) {
            // หากผู้เล่นยังไม่เคยเข้าร่วมเกมใด ๆ ให้บันทึกเซค
            await addDoc(gamePlayersCollection, {
              name,
              pin,
              score: 0,
              userEmail: auth.currentUser.email,
              section: gameSection,
              createAt: createAt,
            });
            console.log("Player added to game_players in Firestore!");
            navigate("/user/index/wait-teacher", { state: { pin, name } });
          } else {
            // หากผู้เล่นเคยเข้าร่วม ให้ตรวจสอบเซค
            const previousSection = playerSnapshot.docs[0].data().section;
  
            if (previousSection === gameSection) {
              await addDoc(gamePlayersCollection, {
                name,
                pin,
                score: 0,
                userEmail: auth.currentUser.email,
                section: gameSection,
                createAt: createAt,
              });
              console.log("Player added to game_players in Firestore!");
              navigate("/user/index/wait-teacher", { state: { pin, name } });
            } else {
              alert("คุณไม่สามารถเข้าร่วมเกมนี้ได้ เนื่องจากอยู่ในเซคที่แตกต่างกัน");
            }
          }
        } else {
          alert("ชื่อผู้เล่นนี้ถูกใช้แล้วในเกมนี้ กรุณาเปลี่ยนชื่อใหม่");
        }
      } else if (!groupSnapshot.empty) {
        // เข้าร่วม group game
        const gameData = groupSnapshot.docs[0].data();
  
        if (gameData.gameStarted) {
          alert("เกมกลุ่มได้เริ่มไปแล้ว ไม่สามารถเข้าร่วมได้");
          return;
        }
  
        const gameSection = gameData.section;
        const nameQuery = query(
          groupPlayersCollection,
          where("pin", "==", pin),
          where("name", "==", name)
        );
        const nameSnapshot = await getDocs(nameQuery);
  
        if (nameSnapshot.empty) {
          // ตรวจสอบว่าเซคตรงกันหรือไม่
          const playerSnapshot = await getDocs(query(groupPlayersCollection, where("userEmail", "==", auth.currentUser.email)));
  
          if (playerSnapshot.empty) {
            // หากผู้เล่นยังไม่เคยเข้าร่วมเกมใด ๆ ให้บันทึกเซค
            await addDoc(groupPlayersCollection, {
              name,
              pin,
              userEmail: auth.currentUser.email,
              section: gameSection,
              createAt: createAt,
              answers: {}
            });
            console.log("Player added to group_players in Firestore!");
            navigate("/user/index/wait-groupgame", { state: { pin, name } });
          } else {
            // หากผู้เล่นเคยเข้าร่วม ให้ตรวจสอบเซค
            const previousSection = playerSnapshot.docs[0].data().section;
  
            if (previousSection === gameSection) {
              await addDoc(groupPlayersCollection, {
                name,
                pin,
                userEmail: auth.currentUser.email,
                section: gameSection,
                createAt: createAt,
                answers: {}
              });
              console.log("Player added to group_players in Firestore!");
              navigate("/user/index/wait-groupgame", { state: { pin, name } });
            } else {
              alert("คุณไม่สามารถเข้าร่วมเกมนี้ได้ เนื่องจากอยู่ในเซคที่แตกต่างกัน");
            }
          }
        } else {
          alert("ชื่อผู้เล่นนี้ถูกใช้แล้วในเกมกลุ่มนี้ กรุณาเปลี่ยนชื่อใหม่");
        }
      } else {
        alert("ไม่พบ PIN ที่ถูกต้อง");
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };
  

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            เข้าร่วมกิจกรรม
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="ชื่อผู้เล่น"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="กรอก PIN"
                fullWidth
                type="number"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={joinRoom}
              >
                เข้าร่วม
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HomepageUser;
