import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  message,
  Space,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { taskStorage, Task } from '../services/taskStorage';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const TaskForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const allTasks = await taskStorage.getAllTasks();
      const foundTask = allTasks.find(t => t.id === id);
      if (foundTask) {
        setTask(foundTask);
        setTags(foundTask.tags || []);
        form.setFieldsValue({
          title: foundTask.title,
          description: foundTask.description,
          priority: foundTask.priority,
          status: foundTask.status,
          dueDate: foundTask.dueDate ? dayjs(foundTask.dueDate) : null,
        });
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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const taskData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        tags: tags,
      };

      if (isEdit) {
        // 编辑模式
        const updatedTask = {
          ...task,
          ...taskData,
        };
        await taskStorage.updateTask(updatedTask);
        message.success('任务更新成功');
      } else {
        // 新建模式
        const newTask = new Task(
          Date.now().toString(),
          taskData.title,
          taskData.description,
          taskData.priority,
          taskData.status,
          taskData.dueDate,
          taskData.tags
        );
        await taskStorage.addTask(newTask);
        message.success('任务创建成功');
      }
      
      navigate('/tasks');
    } catch (error) {
      console.error('Error saving task:', error);
      message.error(isEdit ? '更新任务失败' : '创建任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleTagClose = (removedTag) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/tasks')}
            style={{ marginRight: '10px' }}
          >
            返回
          </Button>
          <h1 className="text-2xl font-medium text-gray-800">
            {isEdit ? '编辑任务' : '新建任务'}
          </h1>
        </div>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: 'medium',
            status: 'pending',
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} lg={16}>
              <Form.Item
                name="title"
                label="任务标题"
                rules={[
                  { required: true, message: '请输入任务标题' },
                  { max: 100, message: '标题不能超过100个字符' },
                ]}
              >
                <Input placeholder="请输入任务标题" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} lg={16}>
              <Form.Item
                name="description"
                label="任务描述"
                rules={[{ max: 500, message: '描述不能超过500个字符' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请输入任务描述（可选）"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="pending">待处理</Option>
                  <Option value="in-progress">进行中</Option>
                  <Option value="completed">已完成</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} lg={12}>
              <Form.Item
                name="dueDate"
                label="截止日期"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择截止日期（可选）"
                  showTime={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item label="标签">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Tag
                        key={tag}
                        closable
                        onClose={() => handleTagClose(tag)}
                        color="blue"
                      >
                        {tag}
                      </Tag>
                    ))}
                    {inputVisible ? (
                      <Input
                        type="text"
                        size="small"
                        style={{ width: 100 }}
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputConfirm}
                        onPressEnter={handleInputConfirm}
                        autoFocus
                      />
                    ) : (
                      <Tag onClick={showInput} className="cursor-pointer">
                        <PlusOutlined /> 添加标签
                      </Tag>
                    )}
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                {isEdit ? '更新任务' : '创建任务'}
              </Button>
              <Button onClick={() => navigate('/tasks')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TaskForm; 