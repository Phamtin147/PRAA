import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
});

// --- Mock Data ---
const mockEmployees = [
  { employeeId: 1, employeeCode: 'EMP001', fullName: 'Tuan Ho Anh', email: 'tuanha@company.com', role: 'Senior Developer', department: 'FSOFT-Q1' },
  { employeeId: 2, employeeCode: 'EMP002', fullName: 'Nguyen Van Nam', email: 'namnv@company.com', role: 'Developer', department: 'FSOFT-Q1' },
  { employeeId: 3, employeeCode: 'EMP003', fullName: 'Tran Thi Lan', email: 'lanti@company.com', role: 'QA Engineer', department: 'FSOFT-Q2' },
  { employeeId: 4, employeeCode: 'EMP004', fullName: 'Le Minh Duc', email: 'duclm@company.com', role: 'Tech Lead', department: 'FSOFT-Q1' },
  { employeeId: 5, employeeCode: 'EMP005', fullName: 'Pham Thi Huong', email: 'huongpt@company.com', role: 'Business Analyst', department: 'FSOFT-Q3' },
  { employeeId: 6, employeeCode: 'EMP006', fullName: 'Hoang Van Khoa', email: 'khoahv@company.com', role: 'Junior Developer', department: 'FSOFT-Q2' },
  { employeeId: 7, employeeCode: 'EMP007', fullName: 'Dang Ngoc Anh', email: 'anhnd@company.com', role: 'Designer', department: 'FSOFT-Q3' },
  { employeeId: 8, employeeCode: 'EMP008', fullName: 'Hannah Lee', email: 'hannah@company.com', role: 'Manager', department: 'Management' },
];

const mockProjects = [
  { projectId: 1, projectCode: 'NCG', projectName: 'Next Generation Commerce Platform', customer: 'Japan Bank Corp', status: 'ACTIVE', startDate: '2026-01-01', endDate: '2026-12-31' },
  { projectId: 2, projectCode: 'GRID', projectName: 'Grid Management System', customer: 'US Energy Co', status: 'ACTIVE', startDate: '2026-03-01', endDate: '2026-09-30' },
  { projectId: 3, projectCode: 'INT-AI', projectName: 'Internal AI Assistant', customer: 'FSOFT Internal', status: 'ACTIVE', startDate: '2026-06-01', endDate: '2026-11-30' },
  { projectId: 4, projectCode: 'LEGACY', projectName: 'Legacy System Maintenance', customer: 'Viettel', status: 'COMPLETED', startDate: '2025-01-01', endDate: '2026-03-31' },
  { projectId: 5, projectCode: 'NEO', projectName: 'Neo Banking Portal', customer: 'Techcombank', status: 'PLANNING', startDate: '2026-08-01', endDate: '2027-06-30' },
  { projectId: 6, projectCode: 'HEALTH', projectName: 'Healthcare Mobile App', customer: 'Vinmec', status: 'PLANNING', startDate: '2026-09-01', endDate: '2027-03-31' },
];

const mockAllocations = [
  { id: 1, employeeId: 1, projectId: 1, allocationPercent: 50, roleInProject: 'Backend Lead', startDate: '2024-01-15', endDate: '2024-08-30' },
  { id: 2, employeeId: 1, projectId: 3, allocationPercent: 30, roleInProject: 'Data Engineer', startDate: '2024-03-01', endDate: '2024-09-15' },
  { id: 3, employeeId: 2, projectId: 2, allocationPercent: 75, roleInProject: 'UI Designer', startDate: '2024-06-01', endDate: '2024-12-31' },
  { id: 4, employeeId: 3, projectId: 1, allocationPercent: 40, roleInProject: 'Project Manager', startDate: '2024-01-15', endDate: '2024-08-30' },
  { id: 5, employeeId: 4, projectId: 3, allocationPercent: 60, roleInProject: 'Backend Developer', startDate: '2024-03-01', endDate: '2024-09-15' },
  { id: 6, employeeId: 5, projectId: 4, allocationPercent: 100, roleInProject: 'Data Analyst', startDate: '2023-06-01', endDate: '2024-02-28' },
  { id: 7, employeeId: 6, projectId: 1, allocationPercent: 35, roleInProject: 'Frontend Developer', startDate: '2024-01-15', endDate: '2024-08-30' },
  { id: 8, employeeId: 6, projectId: 6, allocationPercent: 50, roleInProject: 'Full Stack Dev', startDate: '2024-04-01', endDate: '2024-10-31' },
  { id: 9, employeeId: 7, projectId: 5, allocationPercent: 80, roleInProject: 'Lead Designer', startDate: '2024-07-01', endDate: '2025-03-31' },
  { id: 10, employeeId: 8, projectId: 2, allocationPercent: 60, roleInProject: 'Product Manager', startDate: '2024-06-01', endDate: '2024-12-31' },
];

// Simulated delay
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// --- Generic request wrapper with mock fallback ---
async function request(method, url, data = null) {
  try {
    const response = await API({ method, url, data });
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.warn(`API offline, using mock data for: ${method} ${url}`);
      return mockHandler(method, url, data);
    }
    throw error;
  }
}

// --- Mock handler ---
function mockHandler(method, url, data) {
  let match;
  
  // Employees
  if ((match = url.match(/^\/employees(?:\/(\d+))?$/))) {
    const id = match[1] ? Number(match[1]) : null;
    switch (method.toLowerCase()) {
      case 'get':
        return id ? mockEmployees.find(e => e.id === id) : [...mockEmployees];
      case 'post': {
        const newEmp = { ...data, id: Math.max(...mockEmployees.map(e => e.id)) + 1 };
        mockEmployees.push(newEmp);
        return newEmp;
      }
      case 'put':
        if (id) {
          const idx = mockEmployees.findIndex(e => e.id === id);
          if (idx !== -1) { mockEmployees[idx] = { ...mockEmployees[idx], ...data }; return mockEmployees[idx]; }
        }
        break;
      case 'delete':
        if (id) {
          const delIdx = mockEmployees.findIndex(e => e.id === id);
          if (delIdx !== -1) return mockEmployees.splice(delIdx, 1)[0];
        }
        break;
    }
  }

  // Projects
  if ((match = url.match(/^\/projects(?:\/(\d+))?$/))) {
    const id = match[1] ? Number(match[1]) : null;
    switch (method.toLowerCase()) {
      case 'get':
        return id ? mockProjects.find(p => p.id === id) : [...mockProjects];
      case 'post': {
        const newProj = { ...data, id: Math.max(...mockProjects.map(p => p.id)) + 1 };
        mockProjects.push(newProj);
        return newProj;
      }
      case 'put':
        if (id) {
          const pIdx = mockProjects.findIndex(p => p.id === id);
          if (pIdx !== -1) { mockProjects[pIdx] = { ...mockProjects[pIdx], ...data }; return mockProjects[pIdx]; }
        }
        break;
      case 'delete':
        if (id) {
          const pDelIdx = mockProjects.findIndex(p => p.id === id);
          if (pDelIdx !== -1) return mockProjects.splice(pDelIdx, 1)[0];
        }
        break;
    }
  }

  // Allocations
  if ((match = url.match(/^\/allocations(?:\/(\d+))?$/))) {
    const id = match[1] ? Number(match[1]) : null;
    switch (method.toLowerCase()) {
      case 'get':
        return id ? mockAllocations.find(a => a.id === id) : [...mockAllocations];
      case 'post': {
        const newAlloc = { ...data, id: Math.max(...mockAllocations.map(a => a.id)) + 1 };
        mockAllocations.push(newAlloc);
        return newAlloc;
      }
      case 'put':
        if (id) {
          const aIdx = mockAllocations.findIndex(a => a.id === id);
          if (aIdx !== -1) { mockAllocations[aIdx] = { ...mockAllocations[aIdx], ...data }; return mockAllocations[aIdx]; }
        }
        break;
      case 'delete':
        if (id) {
          const aDelIdx = mockAllocations.findIndex(a => a.id === id);
          if (aDelIdx !== -1) return mockAllocations.splice(aDelIdx, 1)[0];
        }
        break;
    }
  }

  // Workload
  if ((match = url.match(/^\/employees\/(\d+)\/workload$/))) {
    const empId = Number(match[1]);
    const empAllocations = mockAllocations.filter(a => a.employeeId === empId);
    const totalAllocation = empAllocations.reduce((sum, a) => sum + a.allocationPercent, 0);
    return { employeeId: empId, totalAllocation, availablePercent: Math.max(0, 100 - totalAllocation) };
  }

  // Utilization report
  if (url === '/reports/utilization') {
    return mockEmployees.map(emp => {
      const empAllocs = mockAllocations.filter(a => a.employeeId === emp.id);
      const totalAllocation = empAllocs.reduce((sum, a) => sum + a.allocationPercent, 0);
      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        totalAllocation,
        availablePercent: Math.max(0, 100 - totalAllocation),
        role: emp.role,
        department: emp.department,
      };
    });
  }

  // Available resources
  if (url === '/reports/available') {
    return mockEmployees.map(emp => {
      const empAllocs = mockAllocations.filter(a => a.employeeId === emp.id);
      const totalAllocation = empAllocs.reduce((sum, a) => sum + a.allocationPercent, 0);
      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        availablePercent: Math.max(0, 100 - totalAllocation),
        role: emp.role,
        department: emp.department,
      };
    });
  }

  // Overloaded employees
  if (url === '/reports/overloaded') {
    return mockEmployees
      .map(emp => {
        const empAllocs = mockAllocations.filter(a => a.employeeId === emp.id);
        const totalAllocation = empAllocs.reduce((sum, a) => sum + a.allocationPercent, 0);
        return {
          employeeId: emp.id,
          employeeName: emp.fullName,
          totalAllocation,
          role: emp.role,
          department: emp.department,
          allocations: empAllocs,
        };
      })
      .filter(e => e.totalAllocation > 90);
  }

  console.warn(`Unhandled mock URL: ${method} ${url}`);
  return null;
}

// --- Exported API functions ---
export const getEmployees = () => request('get', '/employees');
export const createEmployee = (data) => request('post', '/employees', data);
export const updateEmployee = (id, data) => request('put', `/employees/${id}`, data);
export const deleteEmployee = (id) => request('delete', `/employees/${id}`);

export const getProjects = () => request('get', '/projects');
export const createProject = (data) => request('post', '/projects', data);
export const updateProject = (id, data) => request('put', `/projects/${id}`, data);
export const deleteProject = (id) => request('delete', `/projects/${id}`);

export const getAllocations = () => request('get', '/allocations');
export const createAllocation = (data) => request('post', '/allocations', data);
export const updateAllocation = (id, data) => request('put', `/allocations/${id}`, data);
export const deleteAllocation = (id) => request('delete', `/allocations/${id}`);

export const getWorkload = (empId) => request('get', `/employees/${empId}/workload`);
export const getUtilizationReport = () => request('get', '/reports/utilization');
export const getAvailableResources = () => request('get', '/reports/available');
export const getOverloadedEmployees = () => request('get', '/reports/overloaded');

export default API;
