import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { listUserAdmin, removeUser } from '../../functions/authBackend';
import { Table, TableHead, TableRow, TableBody, TableCell, Paper, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import 'moment/locale/th';

const HomepageAdmin = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData(user.user.token);
  }, []);

  const loadData = (authtoken) => {
    listUserAdmin(authtoken)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  const handleRemoveUser = async (id) => {
    if (window.confirm('แน่ใจนะว่าจะลบ!')) {
      removeUser(user.user.token, id)
        .then((res) => {
          console.log(res);
          loadData(user.user.token);
        })
        .catch((err) => {
          console.log(err.response);
        });
    }
  };

  // กำหนดสีพื้นหลังของ role ตามเงื่อนไข
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'teacher':
        return 'green';
      case 'user':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Paper
      sx={{
        width: '90%',
        margin: 'auto',
        marginTop: '20px',
        padding: '20px',
      }}
    >
      <Typography variant="h4" align="center" sx={{ marginBottom: '20px' }}>
        รายการผู้ใช้
      </Typography>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ลำดับที่</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ชื่อ</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่เข้าร่วม</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เข้าร่วมล่าสุดเมื่อ</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>จัดการผู้ใช้</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell align="">{index + 1}</TableCell>
              <TableCell align="">{item.name}</TableCell>
              <TableCell align="">{item.email}</TableCell>

              {/* ตกแต่งสีพื้นหลังตาม role */}
              <TableCell align="center">
                <Box
                  sx={{
                    backgroundColor: getRoleColor(item.role),
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {item.role}
                </Box>
              </TableCell>

              <TableCell align="center">
                {moment(item.createdAt).locale('th').format('LL')}
              </TableCell>
              <TableCell align="center">
                {moment(item.updatedAt).locale('th').fromNow()}
              </TableCell>
              <TableCell align="center">
                <IconButton onClick={() => handleRemoveUser(item._id)}>
                  <DeleteIcon sx={{ color: 'error.main' }} fontSize="large" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default HomepageAdmin;
