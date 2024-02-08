const express = require('express');
const bodyParser = require('body-parser');
const db = require('./init/index');
const healthzRoutes = require('./routes/healthzRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

db.initDatabase()
    .then(() => {
      console.log('Database initialized successfully');
      return db.sequelize.sync();
    })
    .then(() => {
      console.log('Models synchronized with the database');
    })
    .catch((error) => {
      console.error('Error initializing database:', error);
      process.exit(1);
    });

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

app.use('/healthz', healthzRoutes);
app.use('/v1/user', userRoutes);
