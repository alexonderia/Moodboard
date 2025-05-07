const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к базе данных MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Базовый маршрут
app.get('/', (req, res) => {
  res.send('Hello, Moodboard API!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
