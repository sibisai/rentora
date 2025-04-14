const express = require('express');
const cors = require('cors');
const properties = require('./routes/properties.cjs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', properties);

app.listen(3001, () => {
  console.log('server running at http://localhost:3001');
});
