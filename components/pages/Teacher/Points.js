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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
const Points = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [data, setData] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");

  useEffect(() => {
    loadData(user.user.token);
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
          let dailyScore = 0;
          let weeklyScore = 0;
          let monthlyScore = 0;
          let section = "";

          scoresSnapshot.forEach((doc) => {
            const data = doc.data();
            totalScore += data.score || 0;
            dailyScore += data.dailyScore || 0;
            weeklyScore += data.weeklyScore || 0;
            monthlyScore += data.monthlyScore || 0;
            section = data.section || "";
          });

          return {
            ...item,
            totalScore,
            dailyScore,
            weeklyScore,
            monthlyScore,
            section,
          };
        })
      );

      setData(updatedData);
    } catch (err) {
      console.log(err.response ? err.response.data : err.message);
    }
  };

  const resetDailyScores = async () => {
    const scoresQuery = query(collection(db, "game_players"));
    const scoresSnapshot = await getDocs(scoresQuery);

    await Promise.all(
      scoresSnapshot.docs.map(async (doc) => {
        const userDocRef = doc.ref;
        await updateDoc(userDocRef, { dailyScore: 0 });
      })
    );

    const updatedData = data.map((item) => ({ ...item, dailyScore: 0 }));
    setData(updatedData);
  };

  const resetWeeklyScores = async () => {
    const scoresQuery = query(collection(db, "game_players"));
    const scoresSnapshot = await getDocs(scoresQuery);

    await Promise.all(
      scoresSnapshot.docs.map(async (doc) => {
        const userDocRef = doc.ref;
        await updateDoc(userDocRef, { weeklyScore: 0 });
      })
    );

    const updatedData = data.map((item) => ({ ...item, weeklyScore: 0 }));
    setData(updatedData);
  };

  const resetMonthlyScores = async () => {
    const scoresQuery = query(collection(db, "game_players"));
    const scoresSnapshot = await getDocs(scoresQuery);

    await Promise.all(
      scoresSnapshot.docs.map(async (doc) => {
        const userDocRef = doc.ref;
        await updateDoc(userDocRef, { monthlyScore: 0 });
      })
    );

    const updatedData = data.map((item) => ({ ...item, monthlyScore: 0 }));
    setData(updatedData);
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
      <Paper sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#2196f3" }}>
            <TableRow>
              {[
                "ลำดับที่",
                "ชื่อ",
                "section",
                "คะแนนรายวัน",
                "คะแนนรายสัปดาห์",
                "คะแนนรายเดือน",
                "คะแนนรวม",
              ].map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  {header}
                  {(index === 3 || index === 4 || index === 5) && (
                    <Button
                      onClick={
                        index === 3
                          ? resetDailyScores
                          : index === 4
                          ? resetWeeklyScores
                          : resetMonthlyScores
                      }
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{
                        ml: 1,
                        backgroundColor: "#4caf50",
                        "&:hover": {
                          backgroundColor: "#388e3c",
                        },
                        borderRadius: "20px",
                        textTransform: "none",
                        padding: "2px 8px",
                        fontSize: "0.9rem",
                      }}
                    >
                      รีเซต
                    </Button>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .sort((a, b) => a.section.localeCompare(b.section)) // เรียงลำดับ filteredData
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell align="center">{item.dailyScore}</TableCell>
                  <TableCell align="center">{item.weeklyScore}</TableCell>
                  <TableCell align="center">{item.monthlyScore}</TableCell>
                  <TableCell align="center">{item.totalScore}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          component={Link}
          to="/teacher/manage-teacher"
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
      </Box>
    </Container>
  );
};

export default Points;
