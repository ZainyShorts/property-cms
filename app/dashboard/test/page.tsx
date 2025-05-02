'use client'
import React, { useState, useEffect } from 'react';

const CsvViewer = () => {
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCsvData = async () => {
      try {
        const response = await fetch('https://pludo-public-bucket.s3.eu-north-1.amazonaws.com/UHGFILTER.csv');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawText = await response.text();
        console.log('Raw CSV content:', rawText); // Debugging
        
        // Process the CSV content
        const processedData = rawText
          .split(/\r?\n/) // Split by both Unix and Windows line endings
          .map(row => row.trim())
          .filter(row => row.length > 0); // Remove empty rows
          
        console.log('Processed data:', processedData); // Debugging
        setCsvData(processedData);
        
      } catch (err) {
        console.error('Error fetching CSV:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCsvData();
  }, []);

  if (loading) return <div>Loading CSV data...</div>;
  if (error) return <div>Error loading data: {error}</div>;

  return (
    <div className="csv-container">
      <h2>CSV Content</h2>
      {csvData.length === 0 ? (
        <p>No data found in CSV file</p>
      ) : (
        <div>
          <p>Total rows: {csvData.length}</p>
          <ul>
            {csvData.map((row, index) => (
              <li key={index}>
                Row {index + 1}: <strong>{row}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CsvViewer;