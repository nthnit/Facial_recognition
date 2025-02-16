import React from "react";
import { Layout} from "antd";

const { Header, Content } = Layout;

const Dashboard = () => {
    

    return (
        <Layout style={{ minHeight: "100vh" }}>
            
            <Layout>
                <Header style={{ background: "#fff", padding: 10 }}>Dashboard</Header>
                <Content style={{ margin: "16px", background: "#fff", padding: 24 }}>
                    Chào mừng đến với hệ thống điểm danh lớp học!
                </Content>
            </Layout>
        </Layout>
    );
};

export default Dashboard;
