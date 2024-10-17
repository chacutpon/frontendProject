import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, query, where, updateDoc, getDocs, increment, arrayUnion } from 'firebase/firestore';
import { 
  Container, 
  Typography, 
  Button, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
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
  useMediaQuery,
  Paper,
  LinearProgress
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

const GamePlay = () => {
  const location = useLocation();
  const quizGame = location.state?.quizGame; 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);  
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // State for dialog popup
  const playerName = location.state?.name;
  const [timeLeft, setTimeLeft] = useState(500); 
  const [timeInterval, setTimeInterval] = useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); 

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => (prevTimeLeft > 0 ? prevTimeLeft - 1 : 0));
    }, 1000);
    setTimeInterval(interval);

    if (timeLeft === 0) {
      handleNextQuestion(); 
    }

    return () => clearInterval(interval); 
  }, [timeLeft]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    clearInterval(timeInterval);

    try {
      if (!playerName) { 
        console.error('playerName is undefined');
        setError('เกิดข้อผิดพลาด: ไม่พบชื่อผู้เล่น');
        return; 
      }

      const q = query(
        collection(db, 'game_players'), 
        where('name', '==', playerName), 
        where('pin', '==', quizGame.pin)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const playerDoc = querySnapshot.docs[0];
        const playerData = playerDoc.data();

        // ตรวจสอบว่าผู้เล่นเคยตอบคำถามนี้หรือยัง
        const hasAnswered = playerData.answers?.some(answer => answer.questionIndex === currentQuestionIndex);

        if (hasAnswered) {
          console.log('ผู้เล่นได้ตอบคำถามนี้ไปแล้ว');
          setOpenDialog(true); // เปิด dialog popup เมื่อเคยตอบคำถามแล้ว
          return;
        }

        const answeredAt = new Date();
        let isCorrect = false;

        if (selectedAnswer !== null && quizGame.questions && currentQuestionIndex < quizGame.questions.length) {
          const currentQuestion = quizGame.questions[currentQuestionIndex];
          isCorrect = currentQuestion.answerOptions[selectedAnswer].isCorrect;
        } 

        // อัปเดตคะแนน
        await updateDoc(playerDoc.ref, {
          answers: arrayUnion({ 
            questionIndex: currentQuestionIndex,
            answeredAt: answeredAt,
            isCorrect 
          }),
          score: increment(isCorrect ? 1 : 0),
          dailyScore: increment(isCorrect ? 1 : 0),
          weeklyScore: increment(isCorrect ? 1 : 0),
          monthlyScore: increment(isCorrect ? 1 : 0)
        });

        if (isCorrect) {
          setScore(score + 1); 
        }
      } else {
        console.error('ไม่พบผู้เล่น:', playerName);
        setError('เกิดข้อผิดพลาดในการอัปเดตคะแนน: ไม่พบผู้เล่น'); 
      }
    } catch (error) {
      console.error('Error updating player score:', error);
      setError('เกิดข้อผิดพลาดในการอัปเดตคะแนน');
    }

    if (currentQuestionIndex < quizGame.questions.length - 1) { 
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null); 
      setTimeLeft(15); 
    } else {
      navigate('/user/index'); 
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // ปิด dialog popup
    if (currentQuestionIndex < quizGame.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); // ย้ายไปยังคำถามถัดไป
      setSelectedAnswer(null); 
      setTimeLeft(15); 
    } else {
      navigate('/user/index'); // ถ้าเป็นคำถามสุดท้ายให้ไปยังหน้าถัดไป
    }
  };

  if (!quizGame) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    ); 
  }

  const currentQuestion = quizGame?.questions?.[currentQuestionIndex];

  return (
    <ThemeProvider theme={theme}> 
      <CssBaseline /> 
      <Container maxWidth="sm" sx={{ mt: 4 }}> 
        {/* Dialog Popup */}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              เวลาที่เหลือ: {timeLeft} วินาที
            </Typography> 
            <LinearProgress variant="determinate" value={(timeLeft / 500) * 100} />
          </Box>
          <Typography variant="h5" component="div" sx={{ mb: 2, fontWeight: 'bold' }}> 
            คำถามที่ {currentQuestionIndex + 1}
          </Typography>
          <Typography variant="body1" component="div" sx={{ mb: 2 }}>
            {currentQuestion?.questionText}
          </Typography>
          <RadioGroup 
            value={selectedAnswer} 
            onChange={(event) => handleAnswerSelect(parseInt(event.target.value, 10))}
          >
            {currentQuestion?.answerOptions?.map((option, index) => (
              <FormControlLabel 
                key={index} 
                value={index} 
                control={<Radio />} 
                label={option.answerText} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: isSmallScreen ? '1rem' : '1.2rem', 
                  }
                }}
              />
            ))}
          </RadioGroup>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNextQuestion} 
            sx={{ mt: 2, width: '100%' }}
            disabled={selectedAnswer === null} 
          >
            ถัดไป
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default GamePlay;
