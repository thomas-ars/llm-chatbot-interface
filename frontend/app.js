const express = require('express');
const app = express();
const path = require('path');
const port = 3000; // You can change the port if needed

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));


// Define a route for the homepage
app.get('/', (req, res) => {
  res.send('Hello, this is your Node.js server!');
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

