import React, { useRef, useState } from "react";
import { Modal, Button } from "antd";

const CameraModal = ({ open, onCapture, onCancel }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturing, setCapturing] = useState(false);

    React.useEffect(() => {
        if (open) {
            navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            });
        } else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
        // Cleanup
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [open]);

    const handleCapture = () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
            onCapture(blob);
        }, "image/jpeg");
        setCapturing(false);
    };

    return (
        <Modal open={open} onCancel={onCancel} footer={null} title="Chụp ảnh học sinh" destroyOnClose>
            <div style={{ textAlign: "center" }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: 320, height: 240, borderRadius: 8, border: '1px solid #ccc' }} />
                <div style={{ marginTop: 16 }}>
                    <Button type="primary" onClick={handleCapture} style={{ marginRight: 8 }}>Chụp ảnh</Button>
                    <Button onClick={onCancel}>Đóng</Button>
                </div>
            </div>
        </Modal>
    );
};

export default CameraModal;
