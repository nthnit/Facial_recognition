import React from "react";
import { Form, Input, Select, DatePicker, TimePicker } from "antd";
import moment from "moment";

const { Option } = Select;

const ClassForm = ({
    form,
    teachers = [],
    rooms = [],
    weeklySchedule = [],
    setWeeklySchedule,
    classTimes = {},
    handleClassTimeChange,
    roomSelection = {},
    handleRoomChange,
}) => (
    <Form form={form} layout="vertical">
        <Form.Item label="Tên lớp" name="name" rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}> 
            <Input />
        </Form.Item>
        <Form.Item label="Giáo viên" name="teacher_id" rules={[{ required: true, message: "Vui lòng chọn giáo viên!" }]}> 
            <Select placeholder="Chọn giáo viên">
                {teachers.map((teacher) => (
                    <Option key={teacher.id} value={teacher.id}>{teacher.full_name}</Option>
                ))}
            </Select>
        </Form.Item>
        <Form.Item label="Môn học" name="subject" rules={[{ required: true, message: "Vui lòng nhập môn học!" }]}> 
            <Input />
        </Form.Item>
        <Form.Item label="Ngày bắt đầu" name="start_date" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}> 
            <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="Số buổi học" name="total_sessions" rules={[{ required: true, message: "Vui lòng nhập tổng số buổi học!" }]}> 
            <Input type="number" min={1} />
        </Form.Item>
        <Form.Item label="Lịch học hàng tuần">
            <Select
                mode="multiple"
                placeholder="Chọn ngày học trong tuần"
                value={weeklySchedule}
                onChange={setWeeklySchedule}
                style={{ width: "100%" }}
            >
                <Option value={0}>Thứ Hai</Option>
                <Option value={1}>Thứ Ba</Option>
                <Option value={2}>Thứ Tư</Option>
                <Option value={3}>Thứ Năm</Option>
                <Option value={4}>Thứ Sáu</Option>
                <Option value={5}>Thứ Bảy</Option>
                <Option value={6}>Chủ Nhật</Option>
            </Select>
        </Form.Item>
        {weeklySchedule.map((day) => (
            <div key={day}>
                <h4>{`Thứ ${day + 2}`}</h4>
                <Form.Item label="Giờ bắt đầu" name={`start_time_${day}`}> 
                    <TimePicker
                        format="HH:mm"
                        value={classTimes[day]?.start_time ? moment(classTimes[day]?.start_time, "HH:mm") : null}
                        onChange={(time) => handleClassTimeChange(day, "start_time", time)}
                    />
                </Form.Item>
                <Form.Item label="Giờ kết thúc" name={`end_time_${day}`}> 
                    <TimePicker
                        format="HH:mm"
                        value={classTimes[day]?.end_time ? moment(classTimes[day]?.end_time, "HH:mm") : null}
                        onChange={(time) => handleClassTimeChange(day, "end_time", time)}
                    />
                </Form.Item>
                <Form.Item label="Phòng học" name={`room_id_${day}`}> 
                    <Select
                        value={roomSelection[day]}
                        onChange={(value) => handleRoomChange(day, value)}
                        placeholder="Chọn phòng học"
                    >
                        {rooms.map((room) => (
                            <Option key={room.id} value={room.id}>{room.room_name}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </div>
        ))}
    </Form>
);

export default ClassForm;
