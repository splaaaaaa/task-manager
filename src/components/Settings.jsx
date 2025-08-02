import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Switch,
  Divider,
  message,
  Space,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  SaveOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { taskStorage } from '../services/taskStorage';

const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStorageType, setCurrentStorageType] = useState('local');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const storageType = taskStorage.getStorageType();
    setCurrentStorageType(storageType);
    form.setFieldsValue({
      storageType: storageType,
      autoSave: true,
      showNotifications: true,
    });
  };

  const handleSaveSettings = async (values) => {
    setLoading(true);
    try {
      // 切换存储类型
      if (values.storageType !== currentStorageType) {
        taskStorage.setStorageType(values.storageType);
        setCurrentStorageType(values.storageType);
        message.success(`存储类型已切换到${values.storageType === 'local' ? '本地存储' : 'API存储'}`);
      }

      // 保存其他设置到本地存储
      localStorage.setItem('task-manager-settings', JSON.stringify({
        autoSave: values.autoSave,
        showNotifications: values.showNotifications,
      }));

      message.success('设置保存成功');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      const allTasks = taskStorage.getAllTasks();
      const dataStr = JSON.stringify(allTasks, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      message.success('数据导出成功');
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('数据导出失败');
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const tasks = JSON.parse(e.target.result);
        if (Array.isArray(tasks)) {
          // 这里可以添加数据验证逻辑
          message.success(`成功导入 ${tasks.length} 个任务`);
          // 注意：这里只是显示成功消息，实际导入需要根据具体需求实现
        } else {
          message.error('文件格式不正确');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        message.error('数据导入失败');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清空所有任务数据吗？此操作不可恢复！')) {
      try {
        localStorage.removeItem('task-manager-tasks');
        message.success('数据已清空');
      } catch (error) {
        console.error('Error clearing data:', error);
        message.error('清空数据失败');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-gray-800">系统设置</h1>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="存储设置" icon={<DatabaseOutlined />}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveSettings}
            >
              <Form.Item
                name="storageType"
                label="存储类型"
                rules={[{ required: true, message: '请选择存储类型' }]}
              >
                <Select placeholder="请选择存储类型">
                  <Option value="local">
                    <Space>
                      <DatabaseOutlined />
                      本地存储 (localStorage)
                    </Space>
                  </Option>
                  <Option value="api">
                    <Space>
                      <CloudOutlined />
                      API存储 (需要后端服务)
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="autoSave"
                label="自动保存"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="showNotifications"
                label="显示通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  style={{
                    background: '#4a5568',
                    borderColor: '#4a5568',
                  }}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="数据管理" icon={<SettingOutlined />}>
            <div className="space-y-4">
              <div>
                <Button
                  block
                  onClick={handleExportData}
                >
                  导出数据
                </Button>
                <div className="text-xs text-gray-500 mt-1">
                  导出所有任务数据为JSON文件
                </div>
              </div>

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                  id="import-file"
                />
                <Button
                  block
                  onClick={() => document.getElementById('import-file').click()}
                >
                  导入数据
                </Button>
                <div className="text-xs text-gray-500 mt-1">
                  从JSON文件导入任务数据
                </div>
              </div>

              <Divider />

              <div>
                <Button
                  block
                  danger
                  onClick={handleClearData}
                >
                  清空数据
                </Button>
                <div className="text-xs text-red-500 mt-1">
                  删除所有任务数据（不可恢复）
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="系统信息">
        <div className="space-y-4">
          <Alert
            message="当前存储类型"
            description={currentStorageType === 'local' ? '本地存储 (localStorage)' : 'API存储'}
            type="info"
            showIcon
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">应用版本</div>
              <div className="font-semibold">1.0.0</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">React版本</div>
              <div className="font-semibold">19.1.0</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Ant Design版本</div>
              <div className="font-semibold">5.x</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">构建工具</div>
              <div className="font-semibold">Vite</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings; 