import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';

export default function Home() {
  const [merkmalstexte, setMerkmalstexte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    identnr: '',
    merkmal: '',
    auspraegung: '',
    drucktext: '',
    sondermerkmal: '',
    position: '',
    sonderAbt: '',
    fertigungsliste: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // API endpoint
  const API_BASE = '/api/merkmalstexte';

  // Fetch all records
  useEffect(() => {
    fetchMerkmalstexte();
  }, []);

  const fetchMerkmalstexte = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE);
      setMerkmalstexte(response.data);
      setError(null);
    } catch (err) {
      setError('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Data validation before submit
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      setError('Die eingegebenen Daten sind nicht geeignet: ' + validationErrors.join(', '));
      return;
    }
    
    try {
      if (editingItem) {
        await axios.put(`${API_BASE}/${editingItem.id}`, formData);
      } else {
        await axios.post(API_BASE, formData);
      }
      await fetchMerkmalstexte();
      resetForm();
    } catch (err) {
      setError('Fehler beim Speichern: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        await fetchMerkmalstexte();
      } catch (err) {
        setError('Error deleting record: ' + err.message);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      identnr: item.identnr || '',
      merkmal: item.merkmal || '',
      auspraegung: item.auspraegung || '',
      drucktext: item.drucktext || '',
      sondermerkmal: item.sondermerkmal || '',
      position: item.position || '',
      sonderAbt: item.sonderAbt || '',
      fertigungsliste: item.fertigungsliste || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      identnr: '',
      merkmal: '',
      auspraegung: '',
      drucktext: '',
      sondermerkmal: '',
      position: '',
      sonderAbt: '',
      fertigungsliste: ''
    });
    setEditingItem(null);
    setShowForm(false);
    setError(null); // Clear any validation errors
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Data validation function
  const validateFormData = (data) => {
    const errors = [];
    
    // Required fields validation
    if (!data.identnr?.trim()) errors.push('Identnr ist erforderlich');
    if (!data.merkmal?.trim()) errors.push('Merkmal ist erforderlich');
    if (!data.auspraegung?.trim()) errors.push('Ausprägung ist erforderlich');
    if (!data.drucktext?.trim()) errors.push('Drucktext ist erforderlich');
    
    // Position validation (must be positive number if provided)
    if (data.position && (isNaN(data.position) || parseInt(data.position) < 0)) {
      errors.push('Position muss eine positive Zahl sein');
    }
    
    // SonderAbt validation (must be number if provided)  
    if (data.sonderAbt && isNaN(data.sonderAbt)) {
      errors.push('Sonder Abt. muss eine Zahl sein');
    }
    
    // Fertigungsliste validation (must be number if provided)
    if (data.fertigungsliste && isNaN(data.fertigungsliste)) {
      errors.push('F-Liste muss eine Zahl sein');
    }
    
    return errors;
  };

  // Filter records based on search term (with safe type conversion)
  const filteredMerkmalstexte = merkmalstexte.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.identnr?.toLowerCase().includes(searchLower) ||
      item.merkmal?.toLowerCase().includes(searchLower) ||
      item.auspraegung?.toLowerCase().includes(searchLower) ||
      item.drucktext?.toLowerCase().includes(searchLower) ||
      item.sondermerkmal?.toLowerCase().includes(searchLower) ||
      (item.position ? item.position.toString().toLowerCase().includes(searchLower) : false) ||
      (item.sonderAbt ? item.sonderAbt.toString().toLowerCase().includes(searchLower) : false) ||
      (item.fertigungsliste ? item.fertigungsliste.toString().toLowerCase().includes(searchLower) : false) ||
      item.id?.toString().includes(searchTerm)
    );
  });

  return (
    <div className="App">
      <Head>
        <title>LEBO Merkmalstexte Management</title>
        <meta name="description" content="LEBO Merkmalstexte Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="App-header">
        <div className="header-left">
          <h1>LEBO Merkmalstexte Management</h1>
        </div>
        <div className="header-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>
        <div className="header-buttons">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Abbrechen' : 'Neu hinzufügen'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={fetchMerkmalstexte}
            disabled={loading}
          >
            Aktualisieren
          </button>
        </div>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showForm && (
          <div className="form-container">
            <h2>{editingItem ? 'Edit Record' : 'Add New Record'}</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Ident Nr:</label>
                <input
                  type="text"
                  name="identnr"
                  value={formData.identnr}
                  onChange={handleInputChange}
                  placeholder="z.B. ID001, PART123"
                />
              </div>
              <div className="form-group">
                <label>Merkmal:</label>
                <input
                  type="text"
                  name="merkmal"
                  value={formData.merkmal}
                  onChange={handleInputChange}
                  placeholder="z.B. Farbe, Größe, Material"
                />
              </div>
              <div className="form-group">
                <label>Ausprägung:</label>
                <input
                  type="text"
                  name="auspraegung"
                  value={formData.auspraegung}
                  onChange={handleInputChange}
                  placeholder="z.B. Rot, XL, Aluminium"
                />
              </div>
              <div className="form-group">
                <label>Drucktext:</label>
                <input
                  type="text"
                  name="drucktext"
                  value={formData.drucktext}
                  onChange={handleInputChange}
                  placeholder="z.B. Text für Druck/Ausgabe"
                />
              </div>
              <div className="form-group">
                <label>Sondermerkmal:</label>
                <input
                  type="text"
                  name="sondermerkmal"
                  value={formData.sondermerkmal}
                  onChange={handleInputChange}
                  placeholder="z.B. Besondere Kennzeichnung (optional)"
                />
              </div>
              <div className="form-group">
                <label>Position:</label>
                <input
                  type="number"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="z.B. 1, 2, 3... (Reihenfolge)"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Sonder Abt.:</label>
                <input
                  type="number"
                  name="sonderAbt"
                  value={formData.sonderAbt}
                  onChange={handleInputChange}
                  placeholder="z.B. 100, 200 (Abteilungsnummer)"
                />
              </div>
              <div className="form-group">
                <label>F-Liste:</label>
                <input
                  type="number"
                  name="fertigungsliste"
                  value={formData.fertigungsliste}
                  onChange={handleInputChange}
                  placeholder="z.B. 1, 2, 3... (Fertigungslistennummer)"
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="data-section">
          <h2>
            Datensätze ({filteredMerkmalstexte.length} 
            {searchTerm && ` von ${merkmalstexte.length} gefiltert`})
          </h2>
          {loading ? (
            <div className="loading">Laden...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Identnr</th>
                    <th>Merkmal</th>
                    <th>Ausprägung</th>
                    <th>Drucktext</th>
                    <th>Sondermerkmal</th>
                    <th>Position</th>
                    <th>Sonder Abt.</th>
                    <th>F-Liste</th>
                    <th>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerkmalstexte.slice(0, 50).map((item) => (
                    <tr key={item.id}>
                      <td>{item.identnr}</td>
                      <td>{item.merkmal}</td>
                      <td>{item.auspraegung}</td>
                      <td>{item.drucktext}</td>
                      <td>{item.sondermerkmal}</td>
                      <td>{item.position}</td>
                      <td>{item.sonderAbt}</td>
                      <td>{item.fertigungsliste}</td>
                      <td className="actions">
                        <button 
                          className="btn btn-edit" 
                          onClick={() => handleEdit(item)}
                        >
                          Bearbeiten
                        </button>
                        <button 
                          className="btn btn-delete" 
                          onClick={() => handleDelete(item.id)}
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMerkmalstexte.length === 0 && searchTerm && (
                <p className="table-note">Keine Ergebnisse für "{searchTerm}" gefunden.</p>
              )}
              {filteredMerkmalstexte.length > 50 && (
                <p className="table-note">
                  Die ersten 50 Datensätze von {filteredMerkmalstexte.length} werden angezeigt
                  {searchTerm && ` (gefiltert von ${merkmalstexte.length} Gesamtdatensätzen)`}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}