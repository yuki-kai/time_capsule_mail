import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const handleClick = async () => {
    const apiEndpoint = (window as any).AppConfig.API_ENDPOINT;
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello from the frontend!',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={handleClick}>
          Test
        </button>
      </header>
    </div>
  );
}

export default App;
