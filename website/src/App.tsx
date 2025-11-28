import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const handleClick = async () => {
    const apiEndpoint = (window as any).AppConfig.API_ENDPOINT;
    try {
      // 現在時刻の3分後を取得
      const scheduledAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'タイトル',
          body: '本文',
          email: 'issi0430bjc@gmail.com',
          scheduledAt,
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
