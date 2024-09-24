import { useState, useEffect } from 'react';
import useTheme from './Theme';
import data from '../Link.json';

function PreloadPage() {
  const [bgSize, setBgSize] = useState('contain');
  const [fontSize, setFontSize] = useState('25px'); 

  const Color = `${data.colortheme.split(',')[0]}80`;

  const handleclick = () => {
    window.open(data.logourl, '_blank');
  };

  useTheme(data.colortheme);

  useEffect(() => {
    const updateStyles = () => {
      const width = window.innerWidth;

      if (width < 600) {
        setBgSize('100%');
        setFontSize('20px');
      } else if (width < 900) {
        setBgSize('90%');
        setFontSize('30px');
      } else {
        setBgSize('100%');
        setFontSize('35px');
      }
    };

    updateStyles();

    window.addEventListener('resize', updateStyles);

    return () => {
      window.removeEventListener('resize', updateStyles);
    };
  }, []);

 

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${data.backdrop})`,
        backgroundSize: bgSize,
        backgroundColor: 'var(--bg-color)',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: Color,
        }}
      ></div>

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '3rem',
          cursor: 'pointer',
        }}
        onClick={handleclick}
      >
        <img src={data.logoicon} alt={data.logoalt} style={{ height: '3.5rem' }} />
      </div>

      <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
        <h1
          style={{
            color: 'white',
            marginTop: '10px',
            fontWeight: 'bold',
            fontSize: fontSize,
            fontFamily: 'Segoe UI, sans-serif',
          }}
        >
          Add-In for Stencils
        </h1>
      </div>
    </div>

  );
}

export default PreloadPage;
