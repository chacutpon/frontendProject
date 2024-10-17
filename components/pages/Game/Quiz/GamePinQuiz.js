import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  Box,
  Paper,
  Divider
} from '@mui/material';
import { auth } from '../../../firebase';

const GamePinQuiz = () => {
  const location = useLocation();
  const pin = location.state?.pin; 
  const quizGame = location.state?.quizGame; 
  const [playerNames, setPlayerNames] = useState([]);
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState(null);
  const [gameNotFound, setGameNotFound] = useState(false);

  const quizGamesCollection = collection(db, 'quiz_games');
  const user = auth.currentUser; // รับข้อมูลผู้ใช้ที่ล็อกอิน

  useEffect(() => {
    if (!user) {
      alert('กรุณาล็อกอินเพื่อเข้าถึงข้อมูลนี้');
      navigate('/login'); // หากไม่ได้ล็อกอิน นำทางไปยังหน้าล็อกอิน
      return;
    }

    // ใช้อ้างอิงไปยัง collection game_players
    const gamePlayersCollectionRef = collection(db, 'game_players');
    
    // สร้าง query เพื่อค้นหาผู้เล่นตาม PIN
    const unsubscribePlayers = onSnapshot(
      query(gamePlayersCollectionRef, where('pin', '==', pin)), // เปลี่ยนให้ตรงกับ collection ใหม่
      (snapshot) => {
        const names = snapshot.docs.map((doc) => doc.data().name);
        setPlayerNames(names);
      }
    );

    const unsubscribeGame = onSnapshot(doc(quizGamesCollection, pin), (doc) => {
      if (doc.exists()) {
        setGameStarted(doc.data().gameStarted);
      } else {
        setGameNotFound(true); // ถ้าไม่พบเอกสารเกม
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeGame();
    };
  }, [pin, navigate, user]);

  const handleStartGame = async () => {
    if (gameStarted) {
      setError('เกมได้เริ่มไปแล้ว');
      return;
    }

    try {
      const quizGameRef = doc(quizGamesCollection, pin);
      await updateDoc(quizGameRef, { gameStarted: true });
      navigate('/teacher/create/quiz-game/see-point', { state: { pin, quizGame } }); 
    } catch (error) {
      console.error('Error starting game:', error);
      if (error.code === 'permission-denied') {
        setError('คุณไม่มีสิทธิ์ในการเริ่มเกม');
      } else if (error.code === 'not-found') {
        setError('ไม่พบเอกสารเกม');
      } else {
        setError('เกิดข้อผิดพลาดในการเริ่มเกม กรุณาลองอีกครั้ง');
      }
    }
  };

 
  return (
    <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width: '80%', textAlign: 'center', fontFamily: 'Kanit, sans-serif' }}> 
        {gameNotFound ? (
          <Alert severity="error" onClose={() => setGameNotFound(false)}>
            ไม่พบเกมนี้
          </Alert>
        ) : (
          <>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
              Game PIN: {pin}
            </Typography>
            <Divider sx={{ mb: 3 }} /> {/* เพิ่มเส้นแบ่ง */}
            <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
              ผู้เล่นที่เข้าร่วม:
            </Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {playerNames.map((name, index) => (
                <ListItem key={index}>
                  <ListItemText primary={name} primaryTypographyProps={{ fontFamily: 'Kanit, sans-serif', fontWeight: 'medium' }} />
                </ListItem>
              ))}
            </List>
            {!gameStarted && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleStartGame} sx={{ width: '50%', fontFamily: 'Kanit, sans-serif' }}>
                  เริ่ม
                </Button>
              </Box>
            )}
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default GamePinQuiz;
