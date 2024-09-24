import React, { useState } from 'react';
import { styled } from '@mui/system';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Card,
  CardContent,
  Snackbar,
  TableContainerProps,
} from '@mui/material';

interface PropertyDataItem {
  GroupName: string;
  pLabel: string;
  pValue: string;
}

interface PropertyTableProps {
  propertyData?: PropertyDataItem[];
  stencilResponse?: string;
}

const StyledPropertyCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#778899',
  marginTop: '20px',
  borderRadius: '8px',
  color: 'white',
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
  [theme.breakpoints.down('sm')]: {
    marginTop: '10px',
    padding: '10px',
  },
}));

const StyledTableContainer = styled(TableContainer)<TableContainerProps>({
  width: '100%',
  backgroundColor: '#4e88c9',
  borderRadius: '8px',
  overflow: 'hidden',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: '12px',
});

const StyledTableCellHeader = styled(TableCell)({
  backgroundColor: '#EFEFEF',
  padding: '10px 16px',
  fontWeight: 'bold',
  color: '#333',
  border: '1px solid #778899',
  textAlign: 'left',
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
});

const StyledTableCellBody = styled(TableCell)({
  backgroundColor: '#778899',
  padding: '10px 16px',
  border: '1px solid #ffffff',
  color: 'var(--font-color)',
  position: 'relative',
  textAlign: 'left',
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
});

const CopyIconWrapper = styled('div')({
  position: 'absolute',
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  opacity: 0,
  transition: 'opacity 0.3s',
});

const StyledTableRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: '#ffffff',
  },
  '&:hover .copy-icon': {
    opacity: 1,
  },
  fontSize: '12px',
  fontFamily: 'Segoe UI, sans-serif',
});

const PropertyTable: React.FC<PropertyTableProps> = ({
  propertyData = [],
  stencilResponse = '',
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log('Copied to clipboard:', text);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={
          <span style={{ color: 'var(--black-font)' }}>
            Content copied to clipboard
          </span>
        }
        ContentProps={{
          style: {
            backgroundColor: 'var(--font-color)',
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <StyledPropertyCard>
        <CardContent>
          <StyledTableContainer component={Paper}>
            <Table>
              <TableBody>
                {propertyData
                  .filter((item) => item.GroupName === 'Basic')
                  .map((item, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCellHeader component="th" scope="row">
                        {item.pLabel}
                      </StyledTableCellHeader>
                      <StyledTableCellBody>
                        {item.pValue}
                        <CopyIconWrapper
                          className="copy-icon"
                          onClick={() => copyToClipboard(item.pValue)}
                        >
                          <img
                            src="/assets/Icons/Copy.svg"
                            alt="Copy Icon"
                            style={{
                              width: '16px',
                              height: '16px',
                              cursor: 'pointer',
                            }}
                          />
                        </CopyIconWrapper>
                      </StyledTableCellBody>
                    </StyledTableRow>
                  ))}
                <StyledTableRow>
                  <StyledTableCellHeader component="th" scope="row">
                    Stencil
                  </StyledTableCellHeader>
                  <StyledTableCellBody>
                    {stencilResponse}
                    <CopyIconWrapper
                      className="copy-icon"
                      onClick={() => copyToClipboard(stencilResponse)}
                    >
                      <img
                        src="/assets/Icons/Copy.svg"
                        alt="Copy Icon"
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                    </CopyIconWrapper>
                  </StyledTableCellBody>
                </StyledTableRow>
              </TableBody>
            </Table>
          </StyledTableContainer>
        </CardContent>
      </StyledPropertyCard>
    </>
  );
};

export default PropertyTable;
