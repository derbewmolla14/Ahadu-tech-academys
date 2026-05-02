const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');
const contentRoutes = require('./routes/content');
const courseContentRoutes = require('./routes/courseContent');
const departmentRoutes = require('./routes/departments');
const universityYearRoutes = require('./routes/universityYears');
const universityRoutes = require('./routes/universities');
const universityCourseRoutes = require('./routes/universityCourses');
const universityContentRoutes = require('./routes/universityContent');

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses', universityCourseRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/content', courseContentRoutes);
app.use('/api/content', universityContentRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/university-years', universityYearRoutes);
app.use('/api/universities', universityRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.json({ message: 'Ahadu Tech Academy backend is running' });
});

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });