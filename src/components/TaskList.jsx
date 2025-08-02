import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { taskStorage } from '../services/taskStorage';

const { Search } = Input;
const { Option } = Select;

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
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
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskStorage.deleteTask(taskId);
      message.success('删除任务成功');
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      message.error('删除任务失败');
    }
  };

  const handleBatchDelete = async () => {
    try {
      await taskStorage.deleteMultipleTasks(selectedRowKeys);
      message.success(`成功删除 ${selectedRowKeys.length} 个任务`);
      setSelectedRowKeys([]);
      setDeleteModalVisible(false);
      loadTasks();
    } catch (error) {
      console.error('Error batch deleting tasks:', error);
      message.error('批量删除失败');
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns = [
    {
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.description && (
            <div className="text-gray-500 text-sm mt-1">
              {record.description.length > 50 
                ? `${record.description.substring(0, 50)}...` 
                : record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (dueDate) => dueDate ? new Date(dueDate).toLocaleDateString() : '-',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <div>
          {tags && tags.length > 0 ? (
            tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} color="blue">{tag}</Tag>
            ))
          ) : (
            <span className="text-gray-400">无标签</span>
          )}
          {tags && tags.length > 3 && (
            <Tag color="blue">+{tags.length - 3}</Tag>
          )}
        </div>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => new Date(updatedAt).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/tasks/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/tasks/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个任务吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-gray-800">任务列表</h1>
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

      <Card className="border-gray-200">
        <div className="mb-4 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Search
              placeholder="搜索任务标题或描述"
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="状态筛选"
              style={{ width: 120 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="pending">待处理</Option>
              <Option value="in-progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
            <Select
              placeholder="优先级筛选"
              style={{ width: 120 }}
              value={priorityFilter}
              onChange={setPriorityFilter}
            >
              <Option value="all">全部优先级</Option>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTasks}
            >
              刷新
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                onClick={() => setDeleteModalVisible(true)}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
          </div>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredTasks}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title="确认批量删除"
        open={deleteModalVisible}
        onOk={handleBatchDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <p>确定要删除选中的 {selectedRowKeys.length} 个任务吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
};

export default TaskList; 