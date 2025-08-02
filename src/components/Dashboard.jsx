import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Tag, Button } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { taskStorage, Task } from '../services/taskStorage';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const allTasks = await taskStorage.getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const highPriority = tasks.filter(task => task.priority === 'high').length;

    return {
      total,
      completed,
      pending,
      inProgress,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e53e3e';
      case 'medium':
        return '#d69e2e';
      case 'low':
        return '#38a169';
      default:
        return '#718096';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#38a169';
      case 'in-progress':
        return '#3182ce';
      case 'pending':
        return '#718096';
      default:
        return '#718096';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in-progress':
        return '进行中';
      case 'pending':
        return '待处理';
      default:
        return '未知';
    }
  };

  const stats = getTaskStats();

  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-gray-800">仪表板</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/tasks/new')}
          style={{
            background: '#4a5568',
            borderColor: '#4a5568',
          }}
        >
          新建任务
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-gray-200">
            <Statistic
              title="总任务数"
              value={stats.total}
              prefix={<CheckCircleOutlined style={{ color: '#718096' }} />}
              valueStyle={{ color: '#2d3748' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-gray-200">
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#38a169' }}
              prefix={<CheckCircleOutlined style={{ color: '#38a169' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-gray-200">
            <Statistic
              title="进行中"
              value={stats.inProgress}
              valueStyle={{ color: '#3182ce' }}
              prefix={<ClockCircleOutlined style={{ color: '#3182ce' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-gray-200">
            <Statistic
              title="高优先级"
              value={stats.highPriority}
              valueStyle={{ color: '#e53e3e' }}
              prefix={<ExclamationCircleOutlined style={{ color: '#e53e3e' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 添加间距 */}
      <div style={{ height: '32px' }}></div>

      {/* 完成率 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="任务完成率" className="border-gray-200">
            <Progress
              type="circle"
              percent={stats.completionRate}
              format={percent => `${percent}%`}
              strokeColor={{
                '0%': '#718096',
                '100%': '#38a169',
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="任务状态分布" className="border-gray-200">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">待处理</span>
                <span className="font-medium text-gray-800">{stats.pending}</span>
              </div>
              <Progress 
                percent={stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}
                strokeColor="#718096"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">进行中</span>
                <span className="font-medium text-gray-800">{stats.inProgress}</span>
              </div>
              <Progress 
                percent={stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}
                strokeColor="#3182ce"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">已完成</span>
                <span className="font-medium text-gray-800">{stats.completed}</span>
              </div>
              <Progress 
                percent={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
                strokeColor="#38a169"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 添加间距 */}
      <div style={{ height: '32px' }}></div>

      {/* 最近任务 */}
      <Card 
        title="最近任务" 
        className="border-gray-200"
        extra={
          <Button 
            type="link" 
            onClick={() => navigate('/tasks')}
            style={{ color: '#4a5568' }}
          >
            查看全部
          </Button>
        }
      >
        <List
          loading={loading}
          dataSource={recentTasks}
          renderItem={(task) => (
            <List.Item
              actions={[
                <Button 
                  type="link" 
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  style={{ color: '#4a5568' }}
                >
                  查看详情
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800">{task.title}</span>
                    <Tag 
                      color={getPriorityColor(task.priority)}
                      style={{ 
                        color: 'white',
                        border: 'none',
                        fontSize: '12px',
                        padding: '2px 8px'
                      }}
                    >
                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    </Tag>
                    <Tag 
                      color={getStatusColor(task.status)}
                      style={{ 
                        color: 'white',
                        border: 'none',
                        fontSize: '12px',
                        padding: '2px 8px'
                      }}
                    >
                      {getStatusText(task.status)}
                    </Tag>
                  </div>
                }
                description={
                  <div className="text-gray-500">
                    {task.description || '暂无描述'}
                    {task.dueDate && (
                      <div className="mt-1 text-sm">
                        截止日期: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 