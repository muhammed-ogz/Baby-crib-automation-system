import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Sensor verileri için endpoint
app.get('/v1/values', (req, res) => {
  const temperature = req.query.temperature as string || '0';
  const humidity = req.query.humidity as string || '0';
  const babyTemperature = req.query.babyTemperature as string || '0';

  res.json({
    temperature,
    humidity,
    babyTemperature,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
