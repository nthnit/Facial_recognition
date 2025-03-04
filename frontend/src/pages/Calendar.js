import React from "react";
import { Calendar } from "antd";
import usePageTitle from "./common/usePageTitle";

const ClassCalendar = () => {
    usePageTitle("Calendar");
    return (
        <div style={{ padding: 20 }}>
            <h2>Lịch học</h2>
            <Calendar />
        </div>
    );
};

export default ClassCalendar;
