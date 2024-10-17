import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Card,
  CardContent,
  Avatar,
  Stack,
  Container,
  Grid,
  Divider,
  Tooltip,
  Accordion, // เพิ่ม Accordion
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EditIcon from "@mui/icons-material/Edit"; // เพิ่มไอคอนสำหรับแก้ไข
import moment from "moment";
import "moment/locale/th";
const CreateQuizGame = () => {
  const [storyTH, setStoryTH] = useState("");
  const [section, setSection] = useState(""); // เพิ่ม state สำหรับ section
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [quizGames, setQuizGames] = useState([]); // เพิ่ม state สำหรับเก็บข้อมูล quiz games
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      answerOptions: [
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
      ],
    },
  ]);
  const quizGamesCollection = collection(db, "quiz_games");
  useEffect(() => {
    const unsubscribe = onSnapshot(quizGamesCollection, (snapshot) => {
      const quizGamesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuizGames(quizGamesData);
    });

    return () => unsubscribe();
  }, []);

  const handleQuizGameSelect = async (quizGame) => {
    const generatedPIN = generatePIN();
    setPin(generatedPIN);

    const newQuizGameData = {
      storyTH: quizGame.storyTH,
      questions: quizGame.questions,
      section: quizGame.section, // ใช้ section เดิมจาก quizGame
      createAt: new Date(),
      gameStarted: false,
      pin: generatedPIN,
    };

    try {
      // ลบเอกสาร quiz game เดิม
      await deleteDoc(doc(quizGamesCollection, quizGame.id));

      // สร้างเอกสารใหม่ใน collection "quiz_games" พร้อมกับกำหนด ID เอง
      const newQuizGameRef = doc(quizGamesCollection, generatedPIN);
      await setDoc(newQuizGameRef, newQuizGameData);

      console.log("Quiz game updated with new PIN in Firestore!");
    } catch (error) {
      console.error("Error updating quiz game in Firestore:", error);
    }

    navigate("/teacher/create/quiz-game/game-pin", {
      state: { pin: generatedPIN, quizGame: newQuizGameData },
    });
  };

  const handleStoryTHChange = (text) => {
    setStoryTH(text);
  };

  const handleSectionChange = (event) => {
    setSection(event.target.value); // อัปเดต section เมื่อมีการเลือก
  };
  const handleQuestionTextChange = (questionIndex, text) => {
    const updatedQuestions = [...questions];
    //อันนี้คือบอกลำดับ[questionIndex] ของตัวนี้ questionText = ข้อความก็คือตัวนี้ text
    updatedQuestions[questionIndex].questionText = text;
    //เรียกใช้ฟังก์ชัน setQuestions เพื่ออัปเดต state questions ด้วยค่าใหม่จาก updatedQuestions
    setQuestions(updatedQuestions);
  };

  const handleQuestionOptionChange = (questionIndex, answerIndex, text) => {
    const updatedQuestions = [...questions];
    //อันนี้คือบอกลำดับ[questionIndex] ของตัวนี้ answerOptions ที่ตำแหน่ง [answerIndex]ของตัวนี้ answerText = ข้อความก็คือตัวนี้ text
    updatedQuestions[questionIndex].answerOptions[answerIndex].answerText =
      text;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, answerIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answerOptions.forEach(
      (option, idx) => (option.isCorrect = idx === answerIndex)
    );
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    //เช็คเพื่อให้กรอกข้อมูลทุกอันก่อนไม่งั้นกด Add ไม่ได้
    if (
      !storyTH ||
      !section ||
      questions.some(
        (question) =>
          !question.questionText ||
          !question.answerOptions.some((option) => option.isCorrect)
      )
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return; // หยุดการทำงานของฟังก์ชัน หากข้อมูลไม่ครบ
    }
    //ถ้ากรอกครบแล้วใช้...questionsเพื่อกอปคำถามก่อนหน้าแล้วสร้างตัวใหม่ต่อไป
    setQuestions([
      ...questions,
      {
        questionText: "",
        answerOptions: [
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
          { answerText: "", isCorrect: false },
        ],
      },
    ]);
  };
  const generatePIN = () => {
    const pinLength = 6;
    let pin = "";
    for (let i = 0; i < pinLength; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    return pin;
  };

  const generatedPIN = generatePIN();

  const handleSubmit = async () => {
    setPin(generatedPIN);
    //เช็คเพื่อให้กรอกข้อมูลทุกอันก่อนไม่งั้นกด Submitไม่ได้
    if (
      !storyTH ||
      !section ||
      questions.some(
        (question) =>
          !question.questionText ||
          !question.answerOptions.some((option) => option.isCorrect)
      )
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return; // หยุดการทำงานของฟังก์ชัน หากข้อมูลไม่ครบ
    }

    const formData = {
      // ย้ายการประกาศ formData มาไว้ตรงนี้
      storyTH,
      questions,
      section,
      createAt: new Date(),
      gameStarted: false,
    };

    navigate("/teacher/create/quiz-game/game-pin", {
      state: { pin: generatedPIN, quizGame: { ...formData } },
    });

    try {
      // สร้างเอกสารใหม่ใน collection "quiz_games" พร้อมกับกำหนด ID เอง
      const newQuizGameRef = doc(quizGamesCollection, generatedPIN);
      await setDoc(newQuizGameRef, formData);

      // บันทึก PIN ลงในเอกสารเดียวกัน
      await setDoc(newQuizGameRef, { pin: generatedPIN }, { merge: true });

      console.log("Quiz game added to Firestore with PIN!");

      // Clear the form after submission (if desired)
      setStoryTH("");
      setQuestions([
        {
          questionText: "",
          answerOptions: [
            { answerText: "", isCorrect: false },
            { answerText: "", isCorrect: false },
            { answerText: "", isCorrect: false },
            { answerText: "", isCorrect: false },
          ],
        },
      ]);
    } catch (error) {
      console.error("Error adding quiz game to Firestore:", error);
      if (error.code === "permission-denied") {
        alert("คุณไม่มีสิทธิ์ในการสร้างเกมใหม่");
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างเกม กรุณาลองอีกครั้ง");
      }
    }
  };

  const handleDeleteQuizGame = async (quizGameId) => {
    if (window.confirm("แน่ใจนะว่าจะลบ Quiz Game นี้?")) {
      // เพิ่ม confirmation dialog
      try {
        // ลบเอกสาร quiz game จาก Firestore
        await deleteDoc(doc(quizGamesCollection, quizGameId));
        console.log("Quiz game deleted from Firestore!");
      } catch (error) {
        console.error("Error deleting quiz game from Firestore:", error);
        // TODO: เพิ่มการจัดการข้อผิดพลาดที่เหมาะสม
      }
    } // ถ้ากด "ยกเลิก" จะไม่ทำอะไรเลย
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {" "}
        {/* เปลี่ยน Paper เป็น Card */}
        <CardContent>
          {" "}
          {/* เพิ่ม CardContent */}
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ mb: 2, fontWeight: "bold" }}
          >
            สร้างควิซตอบคำถาม
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="ชื่อหัวข้อเรื่อง"
                multiline
                rows={4}
                fullWidth
                value={storyTH}
                onChange={(e) => handleStoryTHChange(e.target.value)}
                margin="normal"
                variant="outlined"
                InputLabelProps={{ 
                  sx: { 
                    fontSize: '1.2rem', // ปรับขนาดฟอนต์
                    fontWeight: 'bold' // ทำให้ตัวหนา
                  } 
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Section</InputLabel>
                <Select
                  value={section}
                  onChange={handleSectionChange} // ฟังก์ชันจัดการเมื่อเลือก section
                  label="Section"
                  
                >
                  <MenuItem value="SEC1">SEC1</MenuItem>
                  <MenuItem value="SEC2">SEC2</MenuItem>
                  <MenuItem value="SEC3">SEC3</MenuItem>
                  <MenuItem value="SEC4">SEC4</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              {questions.map((question, questionIndex) => (
                <Card
                  key={questionIndex}
                  elevation={1}
                  sx={{ p: 2, mb: 2, borderRadius: 1 }}
                >
                  <CardContent>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography
                          variant="h5"
                          gutterBottom
                          sx={{ fontWeight: "bold",fontSize: '1.8rem' }}
                        >
                          คำถามที่ {questionIndex + 1}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Tooltip title="กรอกคำถามของคุณที่นี่">
                          <HelpOutlineIcon fontSize="medium" color="disabled" />
                        </Tooltip>
                      </Grid>
                    </Grid>

                    <TextField
                      label="ข้อความคำถาม"
                      fullWidth
                      value={question.questionText}
                      onChange={(e) =>
                        handleQuestionTextChange(questionIndex, e.target.value)
                      }
                      margin="normal"
                      variant="outlined"
                    />

                    <FormControl component="fieldset" fullWidth margin="normal">
                      <FormLabel component="legend">ตัวเลือกคำตอบ</FormLabel>
                      <RadioGroup>
                        {question.answerOptions.map(
                          (answerOption, answerIndex) => (
                            <FormControlLabel
                              key={answerIndex}
                              value={answerIndex.toString()}
                              control={<Radio color="primary" />}
                              label={
                                <TextField
                                  label={`ตัวเลือก ${answerIndex + 1}`}
                                  fullWidth
                                  value={answerOption.answerText}
                                  onChange={(e) =>
                                    handleQuestionOptionChange(
                                      questionIndex,
                                      answerIndex,
                                      e.target.value
                                    )
                                  }
                                  margin="dense"
                                  variant="outlined"
                                />
                              }
                              checked={answerOption.isCorrect}
                              onChange={() =>
                                handleCorrectAnswerChange(
                                  questionIndex,
                                  answerIndex
                                )
                              }
                            />
                          )
                        )}
                      </RadioGroup>
                    </FormControl>
                  </CardContent>
                </Card>
              ))}
            </Grid>

            <Grid item xs={12}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddQuestion}
                  startIcon={<AddIcon />}
                >
                  เพิ่มคำถาม
                </Button>
                <Button
                  variant="contained"
                  color="success" // เปลี่ยนสีปุ่ม
                  onClick={handleSubmit}
                  startIcon={<AddIcon />}
                >
                  สร้างควิซ
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                เลือกแบบทดสอบที่มีอยู่
              </Typography>
              <List>
                           
                {quizGames.map((quizGame) => (
                  <Accordion key={quizGame.id}>
                    <AccordionSummary
                      expandIcon={<VisibilityIcon />}
                      aria-controls={`panel${quizGame.id}-content`}
                      id={`panel${quizGame.id}-header`}
                      sx={{
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        "&:hover": { bgcolor: "grey.100" },
                      }}
                    >
                      <ListItemButton
                        onClick={() => handleQuizGameSelect(quizGame)}
                      >
                        <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                          <AssignmentIcon />
                        </Avatar>

                        <ListItemText
                          primary={
                            <Typography
                              sx={{ fontSize: "1.2rem", fontWeight: "bold" }}
                              component="span"
                              color="text.primary"
                            >
                              {"ชื่อหัวข้อ: " + quizGame.storyTH}
                            </Typography>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{
                                  display: "inline",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {quizGame.section}
                              </Typography >
                              {" / "}
                              <Typography
                                sx={{
                                  display: "inline",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                จำนวนคำถาม: {quizGame.questions.length}
                              </Typography>
                              {" / "}
                              <Typography
                                sx={{
                                  display: "inline",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold",
                                }}
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                สร้างเมื่อ:{" "}
                                {moment(quizGame.createAt.toDate())
                                  .locale("th")
                                  .format("LL HH:mm น.")}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItemButton>

                      {/* จัดปุ่มด้วย Stack เพื่อเว้นระยะห่าง */}
                      <Stack direction="row" spacing={2} alignItems="center">
                      <IconButton
  edge="end"
  aria-label="delete"
  onClick={(e) => {
    e.stopPropagation(); // ป้องกันการส่งผลต่อ Accordion
    handleDeleteQuizGame(quizGame.id); // ลบ QuizGame
  }}
  color="error"
>
  <DeleteIcon />
</IconButton>
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails>
                      {" "}
                      {/* แสดงรายละเอียดคำถาม */}
                      <Typography variant="h6" gutterBottom>
                        รายละเอียดคำถาม
                      </Typography>
                      <List>
                        {quizGame.questions.map((question, qIndex) => (
                          <ListItem key={qIndex} disablePadding>
                            <ListItemText
                              primary={
                                <Typography sx={{ fontWeight: "bold" }}>
                                  คำถามที่ {qIndex + 1}: {question.questionText}
                                </Typography>
                              }
                              secondary={
                                <RadioGroup>
                                  {question.answerOptions.map(
                                    (option, oIndex) => (
                                      <FormControlLabel
                                        key={oIndex}
                                        value={oIndex.toString()}
                                        control={
                                          <Radio checked={option.isCorrect} />
                                        }
                                        label={option.answerText}
                                      />
                                    )
                                  )}
                                </RadioGroup>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>
            </Grid>

            <Grid item xs={12}>
              <Link to={"/teacher/create"} style={{ textDecoration: "none" }}>
                <Button
                  component={Link}
                  to="/teacher/create"
                  variant="contained"
                  color="error"
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                    textTransform: "none",
                  }}
                >
                  กลับ
                </Button>
              </Link>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateQuizGame;
