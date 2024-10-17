import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase'; // หรือตำแหน่งไฟล์ firebase ของคุณ
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Button, ListGroup, Card, Container, Row, Col } from 'react-bootstrap';
import { MdDelete } from "react-icons/md";

const PlayerScores = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'players'), (snapshot) => {
      const playersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playersData);
    });

    return () => unsubscribe();
  }, []);

  const handleDeletePlayer = async (playerId) => {
    try {
      await deleteDoc(doc(db, 'players', playerId)); // ลบเอกสารจาก Firestore
      setPlayers(players.filter(player => player.id !== playerId)); // อัปเดต state
    } catch (error) {
      console.error("Error deleting player: ", error);
      // TODO: เพิ่มการจัดการข้อผิดพลาดที่เหมาะสม เช่น แสดงข้อความแจ้งเตือน
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Player Scores</h2>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <ListGroup>
            {players.map((player) => (
              <ListGroup.Item key={player.id} className="d-flex justify-content-between align-items-center">
                <Row className="align-items-center w-100">
                  <Col xs={6}>
                    <strong>{player.name}</strong>
                  </Col>
                  <Col xs={4} className="text-right">
                    คะแนน: {player.score || 0}
                  </Col>
                  <Col xs={2} className="text-right">
                    <Button variant="danger" onClick={() => handleDeletePlayer(player.id)}>
                      <MdDelete />
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PlayerScores;
