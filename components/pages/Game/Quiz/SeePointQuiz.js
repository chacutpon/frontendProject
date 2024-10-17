import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import moment from 'moment';
import 'moment/locale/th';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Avatar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // ไอคอนสำหรับปุ่มขยาย

const SeePointQuiz = () => {
  const location = useLocation();
  const pin = location.state?.pin;
  const quizGame = location.state?.quizGame;
  const [players, setPlayers] = useState([]);
  const [topScorer, setTopScorer] = useState(null);

  useEffect(() => {
    if (pin) { 
      const unsubscribe = onSnapshot(
        query(collection(db, 'game_players'), where('pin', '==', pin)),
        (snapshot) => {
          const playersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPlayers(playersData);
  
          const scoreMap = playersData.map(player => {
            const totalScore = player.answers?.reduce((acc, answer) => acc + (answer.isCorrect ? 1 : 0), 0) || 0;
            const firstAnsweredAt = player.answers?.reduce((earliest, answer) => {
              return earliest && answer.answeredAt.toDate() < earliest ? answer.answeredAt.toDate() : earliest;
            }, null);
            return { ...player, totalScore, firstAnsweredAt };
          });
  
          const maxScore = Math.max(...scoreMap.map(score => score.totalScore));
          const topScorers = scoreMap.filter(player => player.totalScore === maxScore);
  
          let topScorer = topScorers[0];
          if (topScorers.length > 1) {
            topScorer = topScorers.reduce((prev, current) => {
              return (prev.firstAnsweredAt < current.firstAnsweredAt) ? prev : current;
            });
          }
  
          setTopScorer(topScorer);
        }
      );
  
      return () => unsubscribe();
    }
  }, [pin]);

  function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif', color: '#3f51b5' }}>
        คะแนนผู้เล่น
      </Typography>

      {topScorer && (
        <Card sx={{ mb: 4, boxShadow: 3, bgcolor: '#e8f5e9' }}> 
          <CardContent>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif' }}>
              ผู้เล่นที่ทำคะแนนสูงสุด: {topScorer.name} 
              <Chip label={`คะแนน: ${topScorer.totalScore}`} color="primary" sx={{ ml: 1 }} />
            </Typography>
          </CardContent>
        </Card>
      )}

      {quizGame?.questions?.map((question, questionIndex) => (
        <Accordion key={questionIndex} sx={{ mb: 3, boxShadow: 3 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />} // ไอคอนสำหรับกดขยาย/หุบ
            aria-controls={`panel${questionIndex}-content`}
            id={`panel${questionIndex}-header`}
          >
            <Typography variant="h6" sx={{ color: '#3f51b5', fontFamily: 'Sarabun, sans-serif' }}>
              ข้อที่ {questionIndex + 1}  {question.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif' }}>ผู้เล่น</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif' }}>เวลาที่ตอบ</Typography></TableCell>
                    <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif' }}>คะแนน</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {players
                    .map((player) => {
                      const answer = player.answers?.find(a => a.questionIndex === questionIndex);
                      return answer ? { ...player, answer } : null;
                    })
                    .filter(player => player !== null)
                    .sort((a, b) => a.answer.answeredAt.toDate() - b.answer.answeredAt.toDate())
                    .map((player) => (
                      <TableRow key={player.id}>
                        <TableCell component="th" scope="row">
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 1, bgcolor: stringToColor(player.name) }}>{player.name.charAt(0).toUpperCase()}</Avatar>
                            <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>{player.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right"><Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>{moment(player.answer.answeredAt.toDate()).format('HH:mm:ss')}</Typography></TableCell>
                        <TableCell align="center">
                          {player.answer.isCorrect ? (
                            <Chip label="ถูกต้อง +1 คะแนน" color="success" sx={{ fontFamily: 'Sarabun, sans-serif' }} />
                          ) : (
                            <Chip label="ผิด +0 คะแนน" color="error" sx={{ fontFamily: 'Sarabun, sans-serif' }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
<br />
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
    </Container>
  );
}

export default SeePointQuiz;
