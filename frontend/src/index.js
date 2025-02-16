import React from "react";
import ReactDOM from "react-dom/client"; // Dùng createRoot thay vì render
import { ConfigProvider } from "antd";
import App from "./App";
import theme from "./antd-theme";
import "antd/dist/reset.css"; // Import CSS reset của Antd

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
