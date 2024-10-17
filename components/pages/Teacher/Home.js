import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Menu, MenuItem, Box } from '@mui/material';

const Home = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Container 
      sx={{ 
        marginTop: '20px', 
        marginLeft: 0, // ชิดซ้ายหน้าจอ
        fontFamily: 'Prompt, sans-serif' 
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', marginBottom: 2 }}>
        Home Page Teacher
      </Typography>

      <Box sx={{ marginBottom: 2 }}> 
        <Button
          aria-controls={open ? 'menu' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          variant="contained"
          color="primary"
          sx={{ 
            borderRadius: '20px', 
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', 
            textTransform: 'none', 
            '&:hover': {
              backgroundColor: '#00695c', 
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)' 
            }
          }}
        >
          
          เมนู
        </Button>
      </Box>

      <Menu
        id="menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose} 
      >
        <MenuItem component={Link} to="/teacher/create" onClick={handleClose}>
          สร้างกิจกรรม
        </MenuItem>
        <MenuItem component={Link} to="/teacher/manage-teacher" onClick={handleClose}>
          นักศึกษาในห้อง
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Home;