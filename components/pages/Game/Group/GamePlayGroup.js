import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, query, where, updateDoc, getDocs, arrayUnion, onSnapshot } from 'firebase/firestore';
import { 
  Container, 
  Typography, 
  Button, 
  TextField, 
  CircularProgress, 
  Box, 
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#6c757d',
    },
  },
});

const GamePlayGroup = () => {
  const location = useLocation();
  const groupGame = location.state?.groupGame;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [groupAnswers, setGroupAnswers] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const playerName = location.state?.name;

  // Function to fetch group answers
  const fetchGroupAnswers = async () => {
    try {
      const q = query(
        collection(db, 'group_players'),
        where('groupName', '==', groupGame.groupName),
        where('pin', '==', groupGame.pin)
      );
      const querySnapshot = await getDocs(q);
      const answers = [];

      querySnapshot.forEach((doc) => {
        const playerData = doc.data();
        if (Array.isArray(playerData.answers)) {
          playerData.answers.forEach((answer) => {
            if (answer.questionIndex === currentQuestionIndex) {
              answers.push({
                name: playerData.name,
                answer: answer.answer,
              });
            }
          });
        }
      });

      setGroupAnswers(answers);
    } catch (error) {
      console.error('Error fetching group answers:', error);
    }
  };
  useEffect(() => {
    if (groupGame && groupGame.groupName && groupGame.pin) {
      const q = query(
        collection(db, 'group_players'),
        where('groupName', '==', groupGame.groupName),
        where('pin', '==', groupGame.pin)
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const answers = [];
        querySnapshot.forEach((doc) => {
          const playerData = doc.data();
          if (Array.isArray(playerData.answers)) {
            playerData.answers.forEach((answer) => {
              if (answer.questionIndex === currentQuestionIndex) {
                answers.push({
                  name: playerData.name,
                  answer: answer.answer,
                });
              }
            });
          }
        });
        setGroupAnswers(answers); // อัปเดตคำตอบใน state
      });
  
      // Cleanup the subscription on component unmount
      return () => unsubscribe();
    }
  }, [groupGame, currentQuestionIndex]);
  

  const handleNextQuestion = async () => {
    try {
      if (!playerName) {
        console.error('playerName is undefined');
        setError('เกิดข้อผิดพลาด: ไม่พบชื่อผู้เล่น');
        return;
      }

      const q = query(
        collection(db, 'group_players'),
        where('name', '==', playerName),
        where('pin', '==', groupGame.pin)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const playerDoc = querySnapshot.docs[0];
        const playerData = playerDoc.data();
        const hasAnswered = Array.isArray(playerData.answers) && playerData.answers.some(answer => answer.questionIndex === currentQuestionIndex);

        if (hasAnswered) {
          setOpenDialog(true);
          return;
        }

        const answeredAt = new Date();

        await updateDoc(playerDoc.ref, {
          answers: arrayUnion({ 
            questionIndex: currentQuestionIndex,
            answeredAt: answeredAt,
            answer: playerAnswer,
          }),
        });

        fetchGroupAnswers();  // Update group answers after submission
      } else {
        setError('เกิดข้อผิดพลาดในการอัปเดตคำตอบ: ไม่พบผู้เล่น'); 
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการอัปเดตคำตอบ');
    }

    if (currentQuestionIndex < groupGame.questions.length - 1) { 
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setPlayerAnswer('');
    } else {
      navigate('/user/index');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (currentQuestionIndex < groupGame.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setPlayerAnswer('');
    } else {
      navigate('/user/index');
    }
  };

  const currentQuestion = groupGame?.questions?.[currentQuestionIndex];

  return (
    <ThemeProvider theme={theme}> 
      <CssBaseline /> 
      <Container maxWidth="sm" sx={{ mt: 4 }}> 
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>แจ้งเตือน</DialogTitle>
          <DialogContent>
            <DialogContentText>คุณได้ตอบคำถามนี้ไปแล้ว</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">ตกลง</Button>
          </DialogActions>
        </Dialog>

        <Paper elevation={3} sx={{ p: 3, mb: 2, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}> 
            คำถามที่ {currentQuestionIndex + 1}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {currentQuestion?.questionText}
          </Typography>
          <TextField 
            label="พิมพ์คำตอบของคุณที่นี่"
            variant="outlined"
            value={playerAnswer}
            onChange={(event) => setPlayerAnswer(event.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNextQuestion} 
            sx={{ mt: 2, width: '100%' }}
            disabled={playerAnswer === ''}
          >
            ถัดไป
          </Button>
        </Paper>

        <Typography variant="h6" sx={{ mt: 4 }}>
          คำตอบของสมาชิกในกลุ่ม:
        </Typography>
        {groupAnswers.map((answer, index) => (
          <Paper key={index} sx={{ p: 2, mt: 2 }}>
            <Typography variant="body1">
              {answer.name}: {answer.answer}
            </Typography>
          </Paper>
        ))}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default GamePlayGroup;