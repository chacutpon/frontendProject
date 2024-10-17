import React from 'react';
import './Home.css';
import { Typography, Container, Box } from '@mui/material';
import backgroundImage from './image/backgroudImage.jpg'
import test3 from './image/test3.jpg'

const Home = () => {
  return (
    <div style={{  // กำหนด style ให้กับ div หุ้ม Container
      backgroundImage: `url(${test3})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
     <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontFamily: 'Poppins, sans-serif', // เปลี่ยน font เป็น Poppins
            fontWeight: 700, // FontWeight หนักขึ้น

            color: '#333', // เปลี่ยนสีเป็นเทาเข้ม
            mb: 2 
          }}
        >
          Welcome To Interactive Classroom
        </Typography>
        <Typography 
          variant="h5"  // เปลี่ยน variant เป็น h5
          component="h2" 
          gutterBottom 
          sx={{ 
            fontFamily: 'Roboto, sans-serif', // เปลี่ยน font เป็น Roboto
            fontWeight: 400, // FontWeight ปกติ
            fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' }, // ปรับขนาด font ตามขนาดหน้าจอ
            color: '#666', // เปลี่ยนสีเป็นเทาอ่อน
            mb: 2 
          }}
        >
          Please login to join the class
        </Typography>
      </Box>
    </Container>
    </div>
  );
}

export default Home;