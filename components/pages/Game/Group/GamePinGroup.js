import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore'; // นำเข้า getDocs
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

const GamePinGroup = () => {
  const location = useLocation();
  const pin = location.state?.pin; 
  const groupGame = location.state?.groupGame; 
  const [playerNames, setPlayerNames] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState(null);
  const [gameNotFound, setGameNotFound] = useState(false);

  const groupGamesCollection = collection(db, 'group_games');
  const user = auth.currentUser; // รับข้อมูลผู้ใช้ที่ล็อกอิน
  const groupPlayersCollectionRef = collection(db, 'group_players'); // ประกาศที่นี่

  useEffect(() => {
    if (!user) {
      alert('กรุณาล็อกอินเพื่อเข้าถึงข้อมูลนี้');
      navigate('/login');
      return;
    }

    const unsubscribePlayers = onSnapshot(
      query(groupPlayersCollectionRef, where('pin', '==', pin)), 
      (snapshot) => {
        if (snapshot.empty) {
          console.log('No players found for this PIN:', pin);
        } else {
          const names = snapshot.docs.map((doc) => doc.data().name);
          setPlayerNames(names);
        }
      },
      (error) => {
        console.error("Error fetching players: ", error);
      }
    );

    const unsubscribeGame = onSnapshot(doc(groupGamesCollection, pin), (doc) => {
      if (doc.exists()) {
        setGameStarted(doc.data().gameStarted);
      } else {
        setGameNotFound(true);
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
      const groupGameRef = doc(groupGamesCollection, pin);
      await updateDoc(groupGameRef, { gameStarted: true });
      navigate('/teacher/create/group-game/see-point', { state: { pin, groupGame } }); 
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

  const handleRandomizeGroups = async () => {
    const playersPerGroup = groupGame.playerCreate; // จำนวนผู้เล่นที่สร้างไว้ในกลุ่ม
    const totalPlayers = playerNames.length;
  
    // ตรวจสอบว่าจำนวนผู้เล่นเพียงพอหรือไม่
    if (totalPlayers < playersPerGroup) {
      setError('จำนวนผู้เล่นไม่เพียงพอในการสุ่มกลุ่ม');
      return;
    }
  
    // สุ่มผู้เล่น
    const shuffledPlayers = [...playerNames].sort(() => 0.5 - Math.random());
    const newGroups = [];
  
    for (let i = 0; i < shuffledPlayers.length; i += playersPerGroup) {
      const groupName = `กลุ่ม ${Math.floor(i / playersPerGroup) + 1}`;
      const members = shuffledPlayers.slice(i, i + playersPerGroup);
      
      // กำหนดหัวหน้ากลุ่มเป็นผู้เล่นคนแรกในกลุ่ม
      const leader = members[0];
  
      newGroups.push({ groupName, members, leader }); // เพิ่ม leader ในกลุ่ม
  
      // อัปเดตแต่ละสมาชิกในกลุ่มใน Firestore
      for (const member of members) {
        const playerRef = query(groupPlayersCollectionRef, where('name', '==', member)); // แทนที่ด้วยเงื่อนไขที่เหมาะสม
        const playerSnapshot = await getDocs(playerRef);
  
        if (!playerSnapshot.empty) {
          const playerDoc = playerSnapshot.docs[0]; // สมมุติว่าแต่ละชื่อจะมีเอกสารเดียว
          const playerRefToUpdate = doc(groupPlayersCollectionRef, playerDoc.id);
          await updateDoc(playerRefToUpdate, { groupName, leader }); // อัปเดตกลุ่มและหัวหน้าของผู้เล่น
        }
      }
    }
  
    // อัปเดตกลุ่มใน Firestore โดยใช้วัตถุแทน
    const groupRef = doc(groupGamesCollection, pin);
    await setDoc(groupRef, { groups: newGroups }, { merge: true });
  
    setGroups(newGroups);
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
            <Divider sx={{ mb: 3 }} />

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

            {/* แสดงจำนวนกลุ่มที่สร้าง */}
            <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                จำนวนกลุ่มที่สร้าง: {groupGame.groupCreate}
              </Typography>
              <Typography variant="body1" gutterBottom>
                จำนวนผู้เล่นในแต่ละกลุ่ม: {groupGame.playerCreate} คน
              </Typography>
            </Box>

            {/* ปุ่มสุ่มกลุ่ม */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleRandomizeGroups} sx={{ width: '50%', fontFamily: 'Kanit, sans-serif' }}>
                สุ่มกลุ่ม
              </Button>
            </Box>

            {/* แสดงกลุ่มที่สุ่มได้ */}
            <div>
  {groups.length > 0 ? groups.map((group, index) => (
    <div key={index}>
      <h4>{group.groupName}</h4>
      <p>หัวหน้ากลุ่ม: {group.leader}</p> {/* แสดงหัวหน้ากลุ่ม */}
      <p>สมาชิก: {Array.isArray(group.members) ? group.members.join(', ') : 'ไม่มีสมาชิก'}</p>
    </div>
  )) : <p>ยังไม่มีการสุ่มกลุ่ม</p>}
</div>

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

export default GamePinGroup;
