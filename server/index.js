const app = require('./app');
const PORT = process.env.PORT || 3001;
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => { // <<<< DUPLICATE CALL
    console.log(`Server running on port ${PORT}`);
    console.log(`Accepting requests from origin: ${frontendURL}`);
  });
}