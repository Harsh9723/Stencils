import { useRef, useState, useEffect } from 'react';
import { Card } from '@mui/material';
import { insertSvgContentIntoOffice } from '../Common/CommonFunctions';

interface SvgContentProps {
  svgContent: string;
  productnumber: any[];
}

const SvgContent: React.FC<SvgContentProps> = ({ svgContent, productnumber }) => {
  const [shapeCounter, setShapeCounter] = useState(0);
  const [screenSize, setScreenSize] = useState<string>('large');
  const svgRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    await insertSvgContentIntoOffice(svgContent, 'drag', shapeCounter);
    setShapeCounter((prev) => prev + 1);
  };

  const handleDoubleClick = async () => {
    await insertSvgContentIntoOffice(svgContent, 'double-click', shapeCounter);
    setShapeCounter((prev) => prev + 1);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setScreenSize('small');
      } else if (width < 900) {
        setScreenSize('medium');
      } else {
        setScreenSize('large');
      }
    };

    handleResize(); // Initialize on load
    window.addEventListener('resize', handleResize); // Update on resize

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <Card className={`svg-card ${screenSize === 'small' ? 'svg-card-sm' : ''}`}>
        <div
          ref={svgRef}
          className={`svg-wrapper ${screenSize === 'medium' ? 'svg-wrapper-md' : ''} ${
            screenSize === 'small' ? 'svg-wrapper-sm' : ''
          }`}
          draggable
          onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            console.log('Dragging over the target');
          }}
          onDragStart={handleDragStart}
          onDoubleClick={handleDoubleClick}
          title="Drag and Drop Or Double-click To Insert"
        >
          <div dangerouslySetInnerHTML={{ __html: svgContent }} />

          {/* Product Number displayed outside SVG */}
          <h1 className="product-number">{productnumber}</h1>
        </div>
      </Card>
    </div>
  );
};

export default SvgContent;
