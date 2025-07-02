import React, { useState } from "react";
import { Form, Input, Button, DatePicker, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import CameraModal from "./CameraModal";

const StudentForm = ({
    form,
    uploading,
    editingStudent,
    setPreviewFile, // callback để truyền file preview lên cha
    previewImage,
    setPreviewImage
}) => {
    const [cameraModalOpen, setCameraModalOpen] = useState(false);

    // Xử lý upload để chỉ preview, không upload lên server
    const customUpload = (options) => {
        const { file, onSuccess } = options;
        // Hiển thị preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result);
            setPreviewFile && setPreviewFile(file);
        };
        reader.readAsDataURL(file);
        onSuccess("ok"); // Đánh dấu upload thành công (chỉ local)
    };

    // Khi vào form cập nhật, nếu có ảnh cũ thì hiển thị luôn preview ảnh cũ
    React.useEffect(() => {
        if (editingStudent && form.getFieldValue("image_url") && !previewImage) {
            setPreviewImage(null); // Đảm bảo không hiển thị preview mới khi chưa chọn/chụp
        }
    }, [editingStudent, form, previewImage, setPreviewImage]);

    return (
        <Form form={form} layout="vertical">
            <Form.Item label="Họ và Tên" name="full_name" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}> 
                <Input />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ!" }]}> 
                <Input />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phone_number" rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}> 
                <Input />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address"> 
                <Input placeholder="Nhập địa chỉ học sinh" />
            </Form.Item>
            <Form.Item label="Ngày sinh" name="date_of_birth"> 
                <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="Tải ảnh lên">
                <Upload customRequest={customUpload} showUploadList={false} accept="image/*">
                    <Button icon={<UploadOutlined />} loading={uploading}>Chọn ảnh</Button>
                </Upload>
                <Button style={{ marginLeft: 8 }} onClick={() => setCameraModalOpen(true)}>
                    Mở camera
                </Button>
            </Form.Item>
            <CameraModal
                open={cameraModalOpen}
                onCapture={(blob) => {
                    // Hiển thị preview và truyền file lên cha
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setPreviewImage(e.target.result);
                        setPreviewFile && setPreviewFile(file);
                    };
                    reader.readAsDataURL(file);
                    setCameraModalOpen(false);
                }}
                onCancel={() => setCameraModalOpen(false)}
            />
            {/* Nếu là cập nhật, luôn hiển thị ảnh cũ (nếu có) và nếu có preview ảnh mới thì hiển thị song song */}
            {editingStudent && form.getFieldValue("image_url") && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>Ảnh cũ:</div>
                        <img src={form.getFieldValue("image_url")}
                             alt="Student-old"
                             style={{ maxWidth: 120, maxHeight: 120, border: '1px solid #eee', borderRadius: 8 }} />
                    </div>
                    {previewImage && (
                        <div>
                            <div style={{ fontSize: 12, marginBottom: 4 }}>Ảnh mới:</div>
                            <img src={previewImage} alt="Preview" style={{ maxWidth: 120, maxHeight: 120, border: '1px solid #eee', borderRadius: 8 }} />
                        </div>
                    )}
                </div>
            )}
            {/* Nếu là thêm mới hoặc edit mà chỉ có preview ảnh mới thì chỉ hiện ảnh mới */}
            {!editingStudent && previewImage && (
                <div style={{ marginBottom: 16 }}>
                    <img src={previewImage} alt="Preview" style={{ maxWidth: 200, maxHeight: 200, border: '1px solid #eee', borderRadius: 8 }} />
                </div>
            )}
            {/* Nếu là sửa thì vẫn hiện trường đường dẫn ảnh cloud */}
            {editingStudent && (
                <Form.Item label="Đường dẫn ảnh Cloud" name="image_url">
                    <Input placeholder="Đường dẫn ảnh" readOnly />
                </Form.Item>
            )}
        </Form>
    );
};

export default StudentForm;
