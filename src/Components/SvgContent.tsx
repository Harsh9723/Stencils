import { useRef, useState } from 'react';
import { styled } from '@mui/system';
import { Card } from '@mui/material';
import { insertSvgContentIntoOffice } from '../Common/CommonFunctions';

const StyledSvgCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#778899',
  marginTop: '20px',
  borderRadius: '8px',
  color: 'white',
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
  padding: '20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    marginTop: '10px',
    padding: '10px',
  },
}));

const SvgWrapper = styled('div')(({ theme }) => ({
  margin: '0 auto',
  width: '100%',
  maxHeight: '325px',
  maxWidth: '80%',
  '& svg': {
    width: '100%',
    height: 'auto',
    maxHeight: '325px',
    [theme.breakpoints.down('md')]: {
      maxHeight: '250px',
    },
    [theme.breakpoints.down('sm')]: {
      maxHeight: '200px',
    },
  },
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
}));

// Type for the props passed to the SvgContent component
interface SvgContentProps {
  svgContent: string;
}

const SvgContent: React.FC<SvgContentProps> = ({ svgContent }) => {
  const [shapeCounter, setShapeCounter] = useState(0);
  const svgRef = useRef<HTMLDivElement | null>(null);

  // Effect to initialize Office JS once the component is ready
  // useEffect(() => {
  //   Office.onReady((info: Office.AsyncContextOptions) => {
  //     if (info.host === Office.HostType.Word) {
  //       console.log('Office.js is ready');
  //     }
  //   });
  // }, []);

  // Handle drag start event for SVG insertion
  const handleDragStart = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    await insertSvgContentIntoOffice(svgContent, 'drag', shapeCounter);
    setShapeCounter((prev) => prev + 1);
  };

  // Handle double-click event for SVG insertion
  const handleDoubleClick = async () => {
    await insertSvgContentIntoOffice(svgContent, 'double-click', shapeCounter);
    setShapeCounter((prev) => prev + 1);
  };

  return (
    <StyledSvgCard>
      <SvgWrapper
        ref={svgRef}
        draggable
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          console.log('Dragging over the target');
        }}
        onDragStart={handleDragStart}
        onDoubleClick={handleDoubleClick}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        title="Drag and Drop Or Double-click To Insert"
      />
    </StyledSvgCard>
  );
};

export default SvgContent;
