const express = require('express');
const cors = require('cors');
const path = require('path'); // ✅ NECESARIO
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const folderRoutes = require('./routes/folders');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ✅ RUTA CORRECTA

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/folders', folderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
