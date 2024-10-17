import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const SeeAnswerGroup = () => {
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const pin = location.state?.pin;

  useEffect(() => {
    const fetchAnswersAndQuestions = async () => {
      try {
        // ดึงคำถามจาก Firestore
        const questionsSnapshot = await getDocs(query(collection(db, 'group_games'), where('pin', '==', pin)));
        const questionData = questionsSnapshot.docs[0]?.data().questions || [];
        setQuestions(questionData);

        const q = query(collection(db, 'group_players'), where('pin', '==', pin));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const groupedAnswers = {};
          querySnapshot.forEach((doc) => {
            const playerData = doc.data();
            const groupName = playerData.groupName || 'ไม่มีชื่อกลุ่ม'; // ใช้ 'ไม่มีชื่อกลุ่ม' ถ้าไม่มี groupName

            if (!groupedAnswers[groupName]) {
              groupedAnswers[groupName] = {};
            }

            if (Array.isArray(playerData.answers)) {
              playerData.answers.forEach(answer => {
                if (!groupedAnswers[groupName][answer.questionIndex]) {
                  groupedAnswers[groupName][answer.questionIndex] = []; // สร้างอาร์เรย์สำหรับคำถามที่ยังไม่มี
                }
                groupedAnswers[groupName][answer.questionIndex].push({
                  name: playerData.name,
                  answer: answer.answer,
                  answeredAt: answer.answeredAt
                });
              });
            }
          });

          setAnswers(groupedAnswers);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching answers:', error);
          setError('เกิดข้อผิดพลาดในการดึงคำตอบ');
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching answers and questions:', error);
        setError('เกิดข้อผิดพลาดในการดึงคำตอบและคำถาม');
        setLoading(false);
      }
    };

    fetchAnswersAndQuestions();
  }, [pin]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        คำตอบของผู้เล่นในกลุ่ม
      </Typography>
      {Object.keys(answers).length > 0 ? (
        Object.keys(answers).map((groupName) => (
          <Box key={groupName} sx={{ mb: 5, border: '2px solid #1976d2', borderRadius: 2, p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#1976d2' }}>
              กลุ่ม: {groupName}
            </Typography>
            {Object.keys(answers[groupName]).sort((a, b) => a - b).map((questionIndex) => (
              <Box key={questionIndex} sx={{ mb: 3, border: '1px solid #ccc', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  คำถามที่ {parseInt(questionIndex) + 1}: {questions[questionIndex]?.questionText || 'ไม่มีข้อมูลคำถาม'}
                </Typography>
                {Array.isArray(answers[groupName][questionIndex]) ? (
                  answers[groupName][questionIndex].map((item, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="body1">{item.name}</Typography>
                      <Typography variant="body1">คำตอบ: {item.answer}</Typography>
                      <Typography variant="body2" color="textSecondary">ตอบเมื่อ: {item.answeredAt.toDate().toLocaleString()}</Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body1">ไม่มีข้อมูลคำตอบสำหรับคำถามนี้</Typography>
                )}
              </Box>
            ))}
          </Box>
        ))
      ) : (
        <Typography variant="body1">ยังไม่มีคำตอบจากผู้เล่นในกลุ่มนี้</Typography>
      )}
      <Button
                    component={Link} 
                    to="/teacher/index" 
                    variant="contained"
                    color="error" 
                    sx={{ 
                        borderRadius: '20px', 
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', 
                        textTransform: 'none', 
                    }} 
                >
                    กลับ
                </Button>

    </Box>

   
  );
};

export default SeeAnswerGroup;
