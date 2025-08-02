import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  message,
  Popconfirm,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  TagOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { taskStorage } from '../services/taskStorage';

const TaskDetail = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const allTasks = await taskStorage.getAllTasks();
      const foundTask = allTasks.find(t => t.id === id);
      if (foundTask) {
        setTask(foundTask);
      } else {
        message.error('任务不存在');
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error loading task:', error);
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await taskStorage.deleteTask(id);
      message.success('删除任务成功');
      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
      message.error('删除任务失败');
    }
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

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-500">任务不存在</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/tasks')}
            style={{ color: '#4a5568' }}
          >
            返回列表
          </Button>
          <h1 className="text-2xl font-medium text-gray-800">任务详情</h1>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/tasks/${id}/edit`)}
            style={{
              background: '#4a5568',
              borderColor: '#4a5568',
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个任务吗？"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card className="border-gray-200">
        <Descriptions
          title={
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold">{task.title}</span>
              <Tag color={getPriorityColor(task.priority)}>
                {getPriorityText(task.priority)}优先级
              </Tag>
              <Tag color={getStatusColor(task.status)}>
                {getStatusText(task.status)}
              </Tag>
            </div>
          }
          column={1}
          size="large"
        >
          <Descriptions.Item label="任务描述">
            {task.description || '暂无描述'}
          </Descriptions.Item>
          
          <Descriptions.Item label="截止日期">
            {task.dueDate ? (
              <div className="flex items-center space-x-2">
                <CalendarOutlined />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            ) : (
              <span className="text-gray-400">未设置</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="标签">
            {task.tags && task.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Tag key={index} color="blue" icon={<TagOutlined />}>
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">无标签</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="创建时间">
            <div className="flex items-center space-x-2">
              <ClockCircleOutlined />
              <span>{new Date(task.createdAt).toLocaleString()}</span>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="更新时间">
            <div className="flex items-center space-x-2">
              <ClockCircleOutlined />
              <span>{new Date(task.updatedAt).toLocaleString()}</span>
            </div>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">任务信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">任务ID</div>
              <div className="font-mono text-sm">{task.id}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">优先级</div>
              <div className="flex items-center space-x-2">
                <Tag color={getPriorityColor(task.priority)}>
                  {getPriorityText(task.priority)}
                </Tag>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">状态</div>
              <div className="flex items-center space-x-2">
                <Tag color={getStatusColor(task.status)}>
                  {getStatusText(task.status)}
                </Tag>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">标签数量</div>
              <div className="font-semibold">{task.tags ? task.tags.length : 0}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaskDetail; 