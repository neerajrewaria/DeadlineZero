require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const resetPasswordRoutes = require('./src/routes/resetPassword');
const testRoutes = require("./src/routes/testRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const taskRoutes = require("./src/routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes (so Postman URLs match)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/reset-password', resetPasswordRoutes);
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.get('/', (req, res) => {
  res.send('DeadlineZero API is running...');
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect DB:', err);
  });

