// src/components/Upload.js
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

const Upload = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setSnackbarMessage('Veuillez sélectionner un fichier Excel valide.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const file = acceptedFiles[0];
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Supposons que les données sont dans la première feuille
        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Vérifier que le fichier contient au moins 4 lignes (A2 pour le titre, A3 à ignorer, A4 et suivantes pour les élèves)
        if (jsonData.length < 4) {
          throw new Error('Le fichier Excel ne contient pas suffisamment de données.');
        }

        // Récupérer le nom de la RCI depuis la cellule A2 (index 1)
        const rciName = jsonData[1][0];
        if (!rciName) {
          throw new Error('La cellule A2 du fichier Excel est vide.');
        }

        // Récupérer les noms des élèves en ignorant la cellule A3 (index 2) et en filtrant les lignes vides
        const students = jsonData.slice(3)
          .filter(row => row[0]) // Filtrer les lignes où la première cellule (A) n'est pas vide
          .map(row => row[0]);

        if (students.length === 0) {
          throw new Error('Aucun nom d\'élève trouvé dans le fichier Excel.');
        }

        // Préparer les données de prévisualisation
        setPreviewData({ rciName, students });

        setSnackbarMessage('Fichier téléversé avec succès !');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier Excel:', error);
        setSnackbarMessage(error.message);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const generatePDF = (rciName, students) => {
    const doc = new jsPDF();

    // Définir une police en gras pour le titre
    doc.setFont("helvetica", "bold");
    
    // Titre : Affiche uniquement le contenu de la cellule A2 en gras
    doc.setFontSize(18);
    doc.text(rciName, 14, 22);

    // Réinitialiser la police pour le reste du document
    doc.setFont("helvetica", "normal");

    // Définir les colonnes et les lignes du tableau
    const tableColumn = ["Nom de l'Élève", "Présence"];
    const tableRows = students.map(student => [student, ""]); // Laisser la colonne "Présence" vide

    // Configurer le tableau avec les styles souhaités
    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { 
        fontSize: 12, // Taille de la police
        cellPadding: 5, // Espacement des cellules
        halign: 'left', // Alignement horizontal du texte
        valign: 'middle', // Alignement vertical du texte
        lineWidth: 0.1, // Épaisseur des bordures
        lineColor: [0, 0, 0], // Couleur des bordures (noir)
      },
      headStyles: { 
        fillColor: "#2BB673", // Couleur de fond de l'en-tête
        textColor: 255, // Couleur du texte de l'en-tête (blanc)
        fontStyle: 'bold', // Police en gras
        halign: 'center', // Alignement centré pour l'en-tête
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 130 }, // Largeur de la colonne des noms
        1: { cellWidth: 50 },  // Largeur de la colonne Présence
      },
      margin: { left: 14, right: 14 },
      didParseCell: function (data) {
        // Mettre les noms des élèves en gras
        if (data.section === 'body' && data.column.index === 0) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    // Générer le PDF
    const fileName = `Emargement_${rciName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  const handleGeneratePDF = () => {
    if (previewData) {
      generatePDF(previewData.rciName, previewData.students);
      setSnackbarMessage('PDF généré avec succès !');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          {...getRootProps()}
          component={motion.div}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            border: '2px dashed #16a085',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: isDragActive ? '#e0f7fa' : '#fafafa',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            mt: 4, // Ajouter plus d'espace entre le titre et la dropzone
          }}
        >
          <input {...getInputProps()} aria-label="Téléverser un fichier Excel" />
          <CloudUploadIcon sx={{ fontSize: 50, color: '#16a085' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isDragActive ? "Déposez le fichier ici..." : "Glissez-déposez un fichier Excel ici, ou cliquez pour sélectionner"}
          </Typography>
          {loading && <CircularProgress sx={{ mt: 2 }} />}
          <Button variant="contained" color="primary" sx={{ mt: 2 }}>
            Sélectionner un fichier
          </Button>
        </Box>
      </motion.div>

      {/* Prévisualisation du fichier téléversé */}
      <AnimatePresence>
        {previewData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mt: 5 }}>
              {/* Bouton "Générer le PDF" en haut de la prévisualisation */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" onClick={handleGeneratePDF}>
                  Générer le PDF
                </Button>
              </Box>

              {/* Titre de la prévisualisation en gras */}
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                Aperçu de la Fiche d'Émargement
              </Typography>

              {/* Nom de la RCI */}
              <Typography variant="subtitle1" gutterBottom>
                <strong>Nom de la RCI :</strong> {previewData.rciName}
              </Typography>

              {/* Table des élèves */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center"><strong>Nom de l'Élève</strong></TableCell>
                      <TableCell align="center"><strong>Présence</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.students.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{student}</TableCell>
                        <TableCell align="center"></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Upload;
