import React from "react";
import ReactDOM from "react-dom/client"; // Dùng createRoot thay vì render
import { ConfigProvider } from "antd";
import App from "./App";
import theme from "./antd-theme";
import "antd/dist/reset.css"; // Import CSS reset của Antd

const updatedTheme = {
  ...theme,
  token: {
    ...theme.token,
    fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ConfigProvider theme={updatedTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
