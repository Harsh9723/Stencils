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
  maxWidth: '100%',
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

interface SvgContentProps {
  svgContent: string;
  productnumber: any[];
}

const SvgContent: React.FC<SvgContentProps> = ({ svgContent, productnumber }) => {
  const [shapeCounter, setShapeCounter] = useState(0);
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

  return (
    <div>
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
          title="Drag and Drop Or Double-click To Insert"
        >
          <div dangerouslySetInnerHTML={{ __html: svgContent }} />

          {/* Adding the h1 with product number outside the SVG */}
          <h1
            style={{
              textAlign: 'center',
              marginTop: '0px',
              width: '100%',
              fontSize: '12px',
              color: 'var(--font-color)',
              fontWeight: 'bold',

            }}
          >
            {productnumber}
          </h1>
        </SvgWrapper>
      </StyledSvgCard>
    </div>
  );
};

export default SvgContent;
