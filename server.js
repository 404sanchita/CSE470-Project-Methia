import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Destination from './models/destination.js'; 

dotenv.config(); 
console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();
app.use(cors());
app.use(express.json());


connectDB();

app.get('/', (req, res) => {
  res.send('Hello from backend and MongoDB!');
});


app.get('/test', async (req, res) => {
  try {
    const sample = new Destination({
      name: 'Paris',
      country: 'France',
      description: 'The city of lights and love.',
      image: 'https://example.com/paris.jpg',
      bestSeason: 'Spring',
    });

    await sample.save();

    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error testing MongoDB connection');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

