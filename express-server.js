const jsonServer = require('json-server');
const express = require('express');
const path = require('path');

const app = express();
const router = jsonServer.router('data/quotes-data-2.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

// Use json-server middlewares
app.use(middlewares);

// Use the router
app.use('/api', router);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
