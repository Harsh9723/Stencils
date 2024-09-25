import React, { useEffect, useState } from 'react';
import PreloadPage from './Components/PreloadPage';
import MainPage from './Pages/MainPage';
import './App.css';

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
      window.Office.onReady((info: { host: string }) => {
        if (info.host === window.Office.HostType.Word) {
          console.log('Word is ready');
        }
      });
    }
  }, []);

  return (
    <div className='App'>
       {showMainPage ? <MainPage /> : <PreloadPage />}       
    </div>
  );
};

export default App;
