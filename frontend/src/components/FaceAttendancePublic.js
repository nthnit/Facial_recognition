import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Modal, message, Spin, List, Divider, Table, Tag } from 'antd';
import Webcam from 'react-webcam';
import { sendFaceAttendancePublic } from '../api/faceAttendance';
import { useSearchParams, useNavigate } from 'react-router-dom';

const FaceAttendancePublic = () => {
  const webcamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [sessionStatus, setSessionStatus] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const classId = searchParams.get('classId');
  const sessionDate = searchParams.get('sessionDate');
  const intervalRef = useRef(null);

  const captureFrame = useCallback(async () => {
    if (!webcamRef.current || loading) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    const base64String = imageSrc.split(',')[1];
    try {
      setLoading(true);
      const response = await sendFaceAttendancePublic({
        image: base64String,
        classId,
        sessionDate,
      });
      const { student_id, full_name } = response;
      if (student_id && !recognizedStudents.some(s => s.student_id === student_id)) {
        setRecognizedStudents(prev => [...prev, { student_id, full_name }]);
        message.success(`Đã điểm danh: ${full_name}`);
      }
      setSessionStatus('Đang nhận diện khuôn mặt...');
    } catch (error) {
      if (error.response?.status === 422) {
        message.error('Dữ liệu gửi lên không hợp lệ.');
      } else {
        message.warning('Không tìm thấy học sinh phù hợp hoặc lỗi kết nối.');
      }
    } finally {
      setLoading(false);
    }
  }, [webcamRef, loading, recognizedStudents, classId, sessionDate]);

  useEffect(() => {
    if (isCameraOpen && !intervalRef.current) {
      intervalRef.current = setInterval(captureFrame, 2000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isCameraOpen, captureFrame]);

  const handleClose = () => {
    setIsCameraOpen(false);
    setSessionStatus('Đã kết thúc điểm danh!');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Điểm danh khuôn mặt tự động (Public)</h2>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>Quay lại</Button>
      <Modal
        title="Điểm danh khuôn mặt tự động"
        open={isCameraOpen}
        onCancel={handleClose}
        footer={[
          <Button key="close" onClick={handleClose}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ width: '100%' }}
        />
        {recognizedStudents.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3>Học sinh đã được điểm danh:</h3>
            <List
              bordered
              dataSource={recognizedStudents}
              renderItem={(student) => (
                <List.Item>
                  {student.full_name} (ID: {student.student_id})
                </List.Item>
              )}
            />
          </div>
        )}
        {loading && <Spin tip="Đang nhận diện..." />}
        {sessionStatus && <Divider>{sessionStatus}</Divider>}
      </Modal>
    </div>
  );
};

export default FaceAttendancePublic;
