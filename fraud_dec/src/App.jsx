import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Accordion, Navbar, Nav, Modal } from 'react-bootstrap';
import axios from 'axios';
import './App.css';

const App = () => {
  const [conversation, setConversation] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const maxLength = 5000;

  // Load history and theme from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('fraudShieldHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    const savedTheme = localStorage.getItem('fraudShieldTheme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fraudShieldHistory', JSON.stringify(history));
  }, [history]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fraudShieldTheme', darkMode ? 'dark' : 'light');
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (conversation.length > maxLength) {
      setError(`Conversation exceeds ${maxLength} characters. Please shorten it.`);
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/predict`, { conversation });
      setResult(response.data);
      setHistory([
        { conversation, result: response.data, timestamp: new Date().toLocaleString() },
        ...history,
      ]);
    } catch (err) {
      setError(`Error connecting to the server: ${err.message}. Please ensure the Flask API is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setConversation('');
    setResult(null);
    setError('');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('fraudShieldHistory');
  };

  const loadSampleConversation = () => {
    setConversation(
      'Hi, this is Amit from India Post. He said your package is arriving today. Meanwhile, this is Priya from your bank. She said to send your PIN and card number now.'
    );
    setError('');
    setResult(null);
  };

  const copyToClipboard = () => {
    const text = `Label: ${result.label}\nConfidence: ${result.confidence.toFixed(2)}%\nFraud Probability: ${result.fraud_prob.toFixed(2)}%\nNot Fraud Probability: ${result.not_fraud_prob.toFixed(2)}%`;
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard!');
  };

  const exportToCSV = () => {
    const csvRows = [
      ['Timestamp', 'Conversation', 'Label', 'Confidence', 'Fraud Probability', 'Not Fraud Probability'],
      ...history.map(entry => [
        entry.timestamp,
        `"${entry.conversation.replace(/"/g, '""')}"`,
        entry.result.label,
        entry.result.confidence.toFixed(2),
        entry.result.fraud_prob.toFixed(2),
        entry.result.not_fraud_prob.toFixed(2),
      ]),
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fraudshield_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFeedback = (isCorrect) => {
    setFeedback(isCorrect ? 'Thank you! Prediction marked as correct.' : 'Thank you! Prediction marked as incorrect.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        if (text.length > maxLength) {
          setError(`File content exceeds ${maxLength} characters. Please shorten it.`);
          return;
        }
        setConversation(text);
        setError('');
        setResult(null);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar bg={darkMode ? 'dark' : 'light'} variant={darkMode ? 'dark' : 'light'} expand="lg" className="mb-2">
        <Container>
          <Navbar.Brand>FraudShield</Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant={darkMode ? 'light' : 'dark'} onClick={toggleDarkMode} className="me-2">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button variant={darkMode ? 'outline-light' : 'outline-dark'} onClick={() => setShowHelp(true)}>
              Help
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="d-flex flex-column align-items-center pt-2">
        <h1 className="text-center mb-2">FraudShield: AI-Powered Fraud Detection</h1>
        <Card className="p-4 shadow mt-2" style={{ maxWidth: '600px', width: '100%' }}>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="conversationInput" className="mb-3">
              <Form.Label>Enter a Conversation to Check for Fraud</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={conversation}
                onChange={(e) => setConversation(e.target.value)}
                placeholder="Paste the conversation here..."
                required
                maxLength={maxLength}
              />
              <Form.Text className="text-muted">
                {conversation.length}/{maxLength} characters
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="fileUpload" className="mb-3">
              <Form.Label>Or Upload a Text File</Form.Label>
              <Form.Control type="file" accept=".txt" onChange={handleFileUpload} />
            </Form.Group>
            <div className="d-flex justify-content-center gap-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Check for Fraud'}
              </Button>
              <Button variant="outline-info" onClick={loadSampleConversation}>
                Load Sample
              </Button>
              <Button variant="secondary" onClick={handleClear} disabled={loading}>
                Clear
              </Button>
            </div>
          </Form>
        </Card>

        {error && (
          <Alert variant="danger" className="mt-3" style={{ maxWidth: '600px', width: '100%' }}>
            {error}
          </Alert>
        )}

{loading && (
  <Card className="mt-3 p-3 shadow text-center" style={{ maxWidth: '600px', width: '100%' }}>
    <Spinner animation="border" />
    <p>Analyzing conversation...</p>
  </Card>
)}

        {result && !loading && (
          <Card className="mt-3 p-3 shadow" style={{ maxWidth: '600px', width: '100%' }}>
            <h4 className="text-center">Prediction Result</h4>
            <p className="text-center result-text">
              <strong>Label:</strong>{' '}
              <span className={result.label === 'Fraud' ? 'text-danger' : 'text-success'}>
                {result.label}
              </span>
            </p>
            <p className="text-center result-text">
              <strong>Confidence:</strong> {result.confidence.toFixed(2)}%
            </p>
            <p className="text-center result-text">
              <strong>Fraud Probability:</strong> {result.fraud_prob.toFixed(2)}% |{' '}
              <strong>Not Fraud Probability:</strong> {result.not_fraud_prob.toFixed(2)}%
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Button variant="outline-secondary" size="sm" onClick={copyToClipboard}>
                Copy Result
              </Button>
              <Button variant="outline-success" size="sm" onClick={() => handleFeedback(true)}>
                Correct
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => handleFeedback(false)}>
                Incorrect
              </Button>
            </div>
            {feedback && (
              <Alert variant="info" className="mt-2">
                {feedback}
              </Alert>
            )}
          </Card>
        )}

        {history.length > 0 && (
          <div className="mt-5" style={{ maxWidth: '600px', width: '100%' }}>
            <h3 className="text-center mb-3">Prediction History</h3>
            <div className="d-flex justify-content-center gap-2 mb-3">
              <Button variant="danger" onClick={handleClearHistory}>
                Clear History
              </Button>
              <Button variant="success" onClick={exportToCSV}>
                Export History as CSV
              </Button>
            </div>
            <Accordion>
              {history.map((entry, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                    {entry.timestamp} - {entry.result.label}
                  </Accordion.Header>
                  <Accordion.Body>
                    <p><strong>Conversation:</strong> {entry.conversation}</p>
                    <p>
                      <strong>Label:</strong>{' '}
                      <span className={entry.result.label === 'Fraud' ? 'text-danger' : 'text-success'}>
                        {entry.result.label}
                      </span>
                    </p>
                    <p><strong>Confidence:</strong> {entry.result.confidence.toFixed(2)}%</p>
                    <p>
                      <strong>Fraud Probability:</strong> {entry.result.fraud_prob.toFixed(2)}% |{' '}
                      <strong>Not Fraud Probability:</strong> {entry.result.not_fraud_prob.toFixed(2)}%
                    </p>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        )}
      </Container>

      <Modal show={showHelp} onHide={() => setShowHelp(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>How to Use FraudShield</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Welcome to FraudShield! Follow these steps to detect fraud in conversations:</p>
          <ol>
            <li>Enter a conversation in the textarea or upload a text file.</li>
            <li>Click "Check for Fraud" to get a prediction.</li>
            <li>View the prediction result and provide feedback if desired.</li>
            <li>Check your prediction history and export it as a CSV file.</li>
          </ol>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHelp(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;