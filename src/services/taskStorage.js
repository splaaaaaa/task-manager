// 任务数据模型
export class Task {
  constructor(id, title, description = '', priority = 'medium', status = 'pending', dueDate = null, tags = []) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority; // low, medium, high
    this.status = status; // pending, in-progress, completed
    this.dueDate = dueDate;
    this.tags = tags;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

// 本地存储服务
class LocalStorageService {
  constructor() {
    this.storageKey = 'task-manager-tasks';
  }

  // 获取所有任务
  getAllTasks() {
    try {
      const tasks = localStorage.getItem(this.storageKey);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  // 保存所有任务
  saveAllTasks(tasks) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
      return false;
    }
  }

  // 添加任务
  addTask(task) {
    const tasks = this.getAllTasks();
    tasks.push(task);
    return this.saveAllTasks(tasks);
  }

  // 更新任务
  updateTask(updatedTask) {
    const tasks = this.getAllTasks();
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = { ...updatedTask, updatedAt: new Date().toISOString() };
      return this.saveAllTasks(tasks);
    }
    return false;
  }

  // 删除任务
  deleteTask(taskId) {
    const tasks = this.getAllTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    return this.saveAllTasks(filteredTasks);
  }

  // 批量删除任务
  deleteMultipleTasks(taskIds) {
    const tasks = this.getAllTasks();
    const filteredTasks = tasks.filter(task => !taskIds.includes(task.id));
    return this.saveAllTasks(filteredTasks);
  }
}

// API存储服务
class ApiStorageService {
  constructor(baseUrl = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  async getAllTasks() {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks from API:', error);
      return [];
    }
  }

  async addTask(task) {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      if (!response.ok) throw new Error('Failed to add task');
      return await response.json();
    } catch (error) {
      console.error('Error adding task to API:', error);
      return null;
    }
  }

  async updateTask(updatedTask) {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return await response.json();
    } catch (error) {
      console.error('Error updating task in API:', error);
      return null;
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return true;
    } catch (error) {
      console.error('Error deleting task from API:', error);
      return false;
    }
  }

  async deleteMultipleTasks(taskIds) {
    try {
      const response = await fetch(`${this.baseUrl}/tasks/batch`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskIds }),
      });
      if (!response.ok) throw new Error('Failed to delete tasks');
      return true;
    } catch (error) {
      console.error('Error deleting tasks from API:', error);
      return false;
    }
  }
}

// 存储服务工厂
export class TaskStorageService {
  constructor(storageType = 'local') {
    this.storageType = storageType;
    this.localStorage = new LocalStorageService();
    this.apiStorage = new ApiStorageService();
  }

  async getAllTasks() {
    if (this.storageType === 'api') {
      return await this.apiStorage.getAllTasks();
    }
    return this.localStorage.getAllTasks();
  }

  async addTask(task) {
    if (this.storageType === 'api') {
      return await this.apiStorage.addTask(task);
    }
    return this.localStorage.addTask(task);
  }

  async updateTask(task) {
    if (this.storageType === 'api') {
      return await this.apiStorage.updateTask(task);
    }
    return this.localStorage.updateTask(task);
  }

  async deleteTask(taskId) {
    if (this.storageType === 'api') {
      return await this.apiStorage.deleteTask(taskId);
    }
    return this.localStorage.deleteTask(taskId);
  }

  async deleteMultipleTasks(taskIds) {
    if (this.storageType === 'api') {
      return await this.apiStorage.deleteMultipleTasks(taskIds);
    }
    return this.localStorage.deleteMultipleTasks(taskIds);
  }

  // 切换存储类型
  setStorageType(type) {
    this.storageType = type;
  }

  getStorageType() {
    return this.storageType;
  }
}

// 创建默认实例
export const taskStorage = new TaskStorageService('local'); 