import React from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import AppRoutes from "./routes";

function App() {
    return (
        <ConfigProvider theme={{}}>
            <AntdApp>
                <AppRoutes />
            </AntdApp>
        </ConfigProvider>
    );
}

export default App;
