import React, { useEffect, useState } from 'react';
import PreloadPage from './Components/PreloadPage';
import MainPage from './Pages/MainPage';
import './App.css';

// Define any global Office variables if needed
declare global {
  interface Window {
    Office: any;
  }
}

const App: React.FC = () => {
  const [showMainPage, setShowMainPage] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainPage(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.Office) {
      window.Office.initialize = function () {
        console.log('Office is ready.');
      };
    }
  }, []);

  useEffect(() => {
    if (window.Office) {
      // Check if Office is ready for Word
      window.Office.onReady((info: { host: string }) => {
        if (info.host === window.Office.HostType.Word) {
          console.log('Word is ready');
        }
      });
    }
  }, []);

  return (
    <div className="App">
      {/* {showMainPage ? <MainPage /> : <PreloadPage />} 
       */}
       <MainPage />
    </div>
  );
};

export default App;
