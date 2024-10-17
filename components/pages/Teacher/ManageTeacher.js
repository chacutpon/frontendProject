import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { listUserTeacher } from "../../functions/authBackend";
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
  Typography,
  Button,
  Container,
  Box,
  TableContainer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import moment from "moment";
import "moment/locale/th";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const ManageTeacher = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [data, setData] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");

  useEffect(() => {
    loadData(user.user.token);
    const intervalId = setInterval(() => {
      resetScores();
    }, 3600000); // 1 ชั่วโมง

    return () => clearInterval(intervalId);
  }, [user.user.token]);

  const loadData = async (authtoken) => {
    try {
      const res = await listUserTeacher(authtoken);
      if (!res || !res.data) {
        console.error("No data returned from API");
        return;
      }

      const filterUser = res.data.filter((item) => item.role === "user");

      const updatedData = await Promise.all(
        filterUser.map(async (item) => {
          const scoresQuery = query(
            collection(db, "game_players"),
            where("userEmail", "==", item.email)
          );
          const scoresSnapshot = await getDocs(scoresQuery);

          let totalScore = 0;
          let section = ""; // เก็บค่า section

          scoresSnapshot.forEach((doc) => {
            const data = doc.data();
            totalScore += data.score || 0;
            section = data.section; // ดึง section จากข้อมูล
          });

          return {
            ...item,
            totalScore,
            section, // เพิ่ม section ในข้อมูลที่ส่งกลับ
          };
        })
      );

      setData(updatedData);
    } catch (err) {
      console.log(err.response ? err.response.data : err.message);
    }
  };

  const resetScores = async () => {
    const today = new Date();

    const scoresQuery = query(collection(db, "game_players"));
    const scoresSnapshot = await getDocs(scoresQuery);

    scoresSnapshot.forEach(async (doc) => {
      const data = doc.data();
      const userDocRef = doc.ref;

      if (data.lastUpdatedDate !== today.toISOString().split("T")[0]) {
        await updateDoc(userDocRef, {
          lastUpdatedDate: today.toISOString().split("T")[0],
        });
      }
    });
  };

  const filteredData = selectedSection
    ? data.filter((item) => item.section === selectedSection)
    : data;

  return (
    <Container
      maxWidth="xl"
      sx={{ marginTop: "20px", fontFamily: "Prompt, sans-serif" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: "bold" }}>
          รายชื่อนักศึกษา
        </Typography>

        <FormControl sx={{ mt: 2, minWidth: 120 }}>
          <InputLabel>Section</InputLabel>
          <Select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>
            {/* เรียงลำดับ array ก่อนนำไป map */}
            {[...new Set(data.map((item) => item.section))]
              .sort()
              .map((section) => (
                <MenuItem key={section} value={section}>
                  {section}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        component={Paper}
        sx={{ overflowX: "auto", boxShadow: 3 }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#2196f3" }}>
            <TableRow>
              {[
                "ลำดับที่",
                "ชื่อ",
                "Email",
                "section",
                "เข้าร่วมล่าสุดเมื่อ",
              ].map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    textAlign: header === "ลำดับที่" ? "center" : "left",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .sort((a, b) => a.section.localeCompare(b.section)) // เรียงลำดับ filteredData
              .map((item, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.section}</TableCell>

                  <TableCell>
                    {moment(item.updatedAt).locale("th").fromNow()}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
        <Button
          component={Link}
          to="/teacher/index"
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

        <Button
          component={Link}
          to="/teacher/manage-teacher/points"
          variant="contained"
          color="success"
          sx={{
            borderRadius: "20px",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
            textTransform: "none",
          }}
        >
          ตารางคะแนน
        </Button>
      </Box>
    </Container>
  );
};

export default ManageTeacher;
