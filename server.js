const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '.next/static')));
app.use('/_next/static', express.static(path.join(__dirname, '.next/static')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/favicon.ico')));

// Handle all other routes with the HTML shell
const fs = require('fs');

app.get('*', (req, res) => {
  // Try to serve static files first
  const staticPath = path.join(__dirname, '.next', req.path);
  if (fs.existsSync(staticPath) && !fs.statSync(staticPath).isDirectory()) {
    return res.sendFile(staticPath);
  }
  
  // Return the HTML shell for client-side routing
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
