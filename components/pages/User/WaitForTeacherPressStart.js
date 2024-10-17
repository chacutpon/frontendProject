import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../firebase'; 
import { doc, onSnapshot, query, where, getDocs, collection } from 'firebase/firestore';
import {
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
} from '@mui/material';
const WaitQuizGameStart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pin = location.state?.pin;
  const playerName = location.state?.name;

  useEffect(() => {
    console.log("Player Name:", playerName);
    console.log("Pin:", pin);

    const unsubscribeQuizGame = onSnapshot(doc(db, 'quiz_games', pin), (doc) => {
      if (doc.exists() && doc.data().gameStarted) {
        navigate('/user/index/play-game', { state: { quizGame: doc.data(), name: playerName, pin } }); 
      }
    });

    // ตรวจสอบว่าผู้เล่นได้ถูกเพิ่มใน collection 'game_players'
    const unsubscribeGamePlayers = async () => {
      const gamePlayersRef = collection(db, 'game_players');
      const q = query(gamePlayersRef, where('pin', '==', pin)); // ปรับให้ตรงกับการค้นหา
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No players found for this game.");
        // คุณสามารถเพิ่มการแจ้งเตือนหรือ UI สำหรับผู้เล่นที่ไม่พบ
      }
    };

    unsubscribeGamePlayers(); // เรียกใช้ฟังก์ชันนี้

    return () => {
      unsubscribeQuizGame();
    };
  }, [pin, navigate, playerName]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}> 
      <Card elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}> {/* เพิ่มสีพื้นหลังให้ Card */}
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}> 
            รอครูกดเริ่มเกม
          </Typography>

          <Typography variant="h6" align="center" gutterBottom>
            Game PIN: {pin}
          </Typography>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <CircularProgress 
              size={80} // ปรับขนาด CircularProgress
              sx={{ color: 'secondary.main' }} // ปรับสี CircularProgress
            /> 
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to={'/user/index'} style={{ textDecoration: 'none' }}>
              <Button variant="outlined" color="secondary"> {/* ปรับสีปุ่ม */}
                กลับ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
};

export default WaitQuizGameStart
