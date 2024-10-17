import React, { useState, useEffect } from "react";
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  List, 
  ListItemButton,
  ListItemText
} from "@mui/material"; 
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase"; // ปรับเส้นทางให้ถูกต้อง
import { collection, setDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";

const CreateGroupGame = () => {
  const navigate = useNavigate();
  const [storyTH, setStoryTH] = useState("");
  const [pin, setPin] = useState("");
  const [section, setSection] = useState("");
  const [playerCreate, setPlayerCreate] = useState(1); // จำนวนคนในกลุ่ม
  const [groupCreate, setGroupCreate] = useState(1); // จำนวนกลุ่ม
  const [questions, setQuestions] = useState([{ questionText: "" }]);
  const groupGamesCollection = collection(db, "group_games");
  const [selectedGroupGame, setSelectedGroupGame] = useState(null);
  const [groupGames, setGroupGames] = useState([]); 
  useEffect(() => {
    const unsubscribe = onSnapshot(groupGamesCollection, (snapshot) => {
      const games = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroupGames(games); // อัปเดต state groupGames
    });
  
    return () => unsubscribe();
  }, [groupGamesCollection]);
  const handleStoryTHChange = (text) => {
    setStoryTH(text);
  };

  const handleGroupGameSelect = async (groupGame) => {
    const generatedPIN = generatePIN();
    setPin(generatedPIN);

    const newGroupGameData = {
        storyTH: groupGame.storyTH,
        questions: groupGame.questions,
        section: groupGame.section, // ใช้ section เดิมจาก groupGame    
        playerCreate: groupGame.playerCreate, // อัปเดตค่า playerCreate จากเกมที่เลือก
        groupCreate: groupGame.groupCreate, // อัปเดตค่า groupCreate จากเกมที่เลือก
        createAt: new Date(),
        gameStarted: false,
        pin: generatedPIN,
    };

    try {
        // ลบเอกสาร quiz game เดิม
        await deleteDoc(doc(groupGamesCollection, groupGame.id));

        // สร้างเอกสารใหม่ใน collection "quiz_games" พร้อมกับกำหนด ID เอง
        const newGroupGameRef = doc(groupGamesCollection, generatedPIN);
        await setDoc(newGroupGameRef, newGroupGameData);

        console.log("Quiz game updated with new PIN in Firestore!");
    } catch (error) {
        console.error("Error updating quiz game in Firestore:", error);
    }

    navigate("/teacher/create/group-game/game-pin", {
        state: { pin: generatedPIN, groupGame: newGroupGameData },
    });
};

  const handleAddQuestion = () => {
    // ตรวจสอบว่าคำถามมีข้อมูลครบหรือไม่
    const hasEmptyQuestion = questions.some(q => q.questionText.trim() === "");
    if (hasEmptyQuestion) {
      alert("กรุณากรอกคำถามให้ครบก่อนเพิ่มคำถามใหม่");
      return;
    }
    setQuestions([...questions, { questionText: "" }]);
  };

  const generatePIN = () => {
    const pinLength = 6;
    let pin = "";
    for (let i = 0; i < pinLength; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    return pin;
  };

  const handleSectionChange = (event) => {
    setSection(event.target.value); // อัปเดต section เมื่อมีการเลือก
  };

  const handleQuestionTextChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    // ตรวจสอบว่ามีคำถามที่ว่างอยู่ก่อนส่ง
    const hasEmptyQuestion = questions.some(q => q.questionText.trim() === "");
    if (hasEmptyQuestion) {
      alert("กรุณากรอกคำถามให้ครบก่อนส่ง");
      return;
    }

    const generatedPIN = generatePIN();
    setPin(generatedPIN);

    const formData = {
      storyTH,
      questions,
      section,
      playerCreate,
      groupCreate,
      createAt: new Date(),
      gameStarted: false,
    };

    navigate("/teacher/create/group-game/game-pin", {
      state: { pin: generatedPIN, groupGame: { ...formData } },
    });

    try {
      const newGroupGameRef = doc(groupGamesCollection, generatedPIN);
      await setDoc(newGroupGameRef, formData);

      await setDoc(newGroupGameRef, { pin: generatedPIN }, { merge: true });

      console.log("Group game added to Firestore with PIN!");
    } catch (error) {
      console.error("Error adding group game to Firestore:", error);
      if (error.code === "permission-denied") {
        alert("คุณไม่มีสิทธิ์ในการสร้างเกมใหม่");
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างเกม กรุณาลองอีกครั้ง");
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        สร้างเกมตอบคำถาม
      </Typography>
  
      <TextField
        label="Story (Thai)"
        multiline
        rows={4}
        value={storyTH}
        onChange={(e) => handleStoryTHChange(e.target.value)}
        fullWidth
        margin="normal"
      />
  
      <FormControl fullWidth margin="normal">
        <InputLabel id="section-label">Section</InputLabel>
        <Select
          labelId="section-label"
          value={section}
          onChange={handleSectionChange}
          label="Section"
        >
          <MenuItem value="SEC1">SEC1</MenuItem>
          <MenuItem value="SEC2">SEC2</MenuItem>
          <MenuItem value="SEC3">SEC3</MenuItem>
          <MenuItem value="SEC4">SEC4</MenuItem>
        </Select>
      </FormControl>
  
      <TextField
        label="จำนวนคนต่อกลุ่ม"
        type="number"
        value={playerCreate}
        onChange={(e) => setPlayerCreate(Math.max(1, parseInt(e.target.value, 10) || 1))}
        fullWidth
        margin="normal"
      />
      <Typography variant="caption" color="textSecondary">
        กรุณากรอกจำนวนคนต่อกลุ่ม (1 หรือมากกว่า)
      </Typography>
  
      <TextField
        label="จำนวนกลุ่ม"
        type="number"
        value={groupCreate}
        onChange={(e) => setGroupCreate(Math.max(1, parseInt(e.target.value, 10) || 1))}
        fullWidth
        margin="normal"
      />
      <Typography variant="caption" color="textSecondary">
        กรุณากรอกจำนวนกลุ่ม (1 หรือมากกว่า)
      </Typography>
  
      {questions.map((question, questionIndex) => (
        <Box key={questionIndex} sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            คำถาม {questionIndex + 1}
          </Typography>
          <TextField
            label="ข้อความคำถาม"
            value={question.questionText}
            onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>
      ))}
  
      <Button variant="contained" color="primary" onClick={handleAddQuestion}>
        เพิ่มคำถาม
      </Button>
      
      <Button variant="contained" color="success" onClick={handleSubmit} sx={{ mt: 2 }}>
        ส่ง
      </Button>
  
      <Typography variant="h6" gutterBottom>
        เลือกเกมกลุ่ม
      </Typography>
      {groupGames.map((game) => (
        <Box key={game.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ListItemButton 
            onClick={() => handleGroupGameSelect(game)}
            sx={{ flexGrow: 1 }} // ทำให้ ListItemButton ขยายเต็มที่
          >
            {game.storyTH}
          </ListItemButton>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={async (e) => {
              e.stopPropagation(); // หยุดการ propagating event เพื่อไม่ให้เรียก handleGroupGameSelect
              await deleteDoc(doc(groupGamesCollection, game.id));
              console.log(`Game ${game.id} deleted from Firestore.`);
            }}
          >
            ลบ
          </Button>
        </Box>
      ))}
  
      <Link to={'/teacher/create'}>
        <Button variant="contained" sx={{ mt: 2 }}>ย้อนกลับ</Button>
      </Link>
    </Box>
  );

};

export default CreateGroupGame;
