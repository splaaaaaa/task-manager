import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { LoadingOutlined } from '@ant-design/icons';
import Layout from './components/Layout';
import './App.css';

// 懒加载组件
const TaskList = React.lazy(() => import('./components/TaskList'));
const TaskForm = React.lazy(() => import('./components/TaskForm'));
const TaskDetail = React.lazy(() => import('./components/TaskDetail'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Settings = React.lazy(() => import('./components/Settings'));

// 加载组件
const LoadingComponent = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingOutlined style={{ fontSize: 24 }} spin />
    <span className="ml-2">加载中...</span>
  </div>
);

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Suspense fallback={<LoadingComponent />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
