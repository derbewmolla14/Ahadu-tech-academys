import api from './api';

const getUniversities = () => api.get('/universities').then((res) => res.data);
const getUniversityDetails = (name) => api.get(`/universities/${encodeURIComponent(name)}`).then((res) => res.data);
const getLevels = (name) => api.get(`/universities/${encodeURIComponent(name)}/levels`).then((res) => res.data);
const getDepartments = (name, level) => api.get(`/universities/${encodeURIComponent(name)}/departments`, { params: { level } }).then((res) => res.data);
const getCourses = (university, level, department) => api.get('/courses', { params: { university, level, department } }).then((res) => res.data);
const getContent = (courseId) => api.get(`/content/${encodeURIComponent(courseId)}`).then((res) => res.data);

export default {
  getUniversities,
  getUniversityDetails,
  getLevels,
  getDepartments,
  getCourses,
  getContent,
};
