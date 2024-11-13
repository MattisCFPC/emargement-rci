// src/App.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Upload from './components/Upload';
import './App.css';
import logo from './assets/logo.png'; // Assurez-vous d'ajouter un logo dans le dossier src/assets

function App() {
  return (
    <>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <img src={logo} alt="Logo RCI" style={{ width: '150px', marginBottom: '20px' }} />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }} // Mettre le titre en gras
          >
            Application d'Émargement pour RCI
          </Typography>
          <Upload />
        </Box>
      </Container>
    </>
  );
}

export default App;
