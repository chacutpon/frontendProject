import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Typography, Menu, MenuItem, Box, Paper } from "@mui/material";

const Create = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        textAlign: "center", // จัดข้อความให้อยู่กลาง
        marginTop: "40px",
        fontFamily: 'Prompt, sans-serif', 
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, borderRadius: '16px' }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', marginBottom: 3 }}>
          สร้างกิจกรรม
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link to="/teacher/create/asking-game" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              sx={{ 
                borderRadius: '20px', 
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)', 
                textTransform: 'none', 
                padding: '12px',
                fontSize: '1.5rem', // ปรับขนาดฟอนต์
                backgroundColor: '#4CAF50',
                width: '60%',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#45a049',
                }
              }}
            >
              พิมตอบคำถาม
            </Button>
          </Link>

          <Link to="/teacher/create/group-game" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              sx={{ 
                borderRadius: '20px', 
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)', 
                textTransform: 'none', 
                padding: '12px',
                fontSize: '1.5rem', // ปรับขนาดฟอนต์
                backgroundColor: '#2196F3',
                width: '60%',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1976D2',
                }
              }}
            >
              ตอบคำถามแบบกลุ่ม
            </Button>
          </Link>

          <Link to="/teacher/create/quiz-game" style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              sx={{ 
                borderRadius: '20px', 
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)', 
                textTransform: 'none', 
                padding: '12px',
                fontSize: '1.5rem', // ปรับขนาดฟอนต์
                backgroundColor: '#FF9800',
                width: '60%',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#FB8C00',
                }
              }}
            >
              ควิซ
            </Button>
          </Link>
        </Box>

        <Box sx={{ marginTop: 3 }}> 
          <Link to="/teacher/index" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              color="error" 
              sx={{ 
                borderRadius: '20px', 
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', 
                textTransform: 'none', 
                padding: '12px',
                fontSize: '1.5rem', // ปรับขนาดฟอนต์
                width: '60%', // กำหนดให้ปุ่มมีความกว้างเท่ากัน
              }} 
            >
              กลับ
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default Create;