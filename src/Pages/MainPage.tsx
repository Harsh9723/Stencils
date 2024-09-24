import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography, IconButton, CircularProgress, Snackbar, TypographyProps } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import data from '../Link.json'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import useTheme from '../Components/Theme';
import axios from 'axios';
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, FormGroup, Checkbox, Button, SelectChangeEvent } from '@mui/material';
import { Search, transformToTreeData } from '../Common/CommonFunctions'
import Treedata from './TreeData';
import Setting from './Setting';
import BASE_URL from '../Config/Config';

interface Manufacturer {
  MfgAcronym: string;
  Manufacturer: string
}

interface EqType {
  eqtype: string,
}

interface ProductLine {
 
}

interface ProductNumber {

}


const SearchComponent = () => {

  const [loading, setLoading] = useState<boolean>(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [eqTypes, setEqTypes] = useState<EqType[]>([]);
  const [selectedEqType, setSelectedEqType] = useState<string>('');
  const [productLine, setProductLine] = useState<ProductLine[]>([]);
  const [selectedProductLine, setSelectedProductLine] = useState<string>('');
  const [productNumber, setProductNumber] = useState<ProductNumber[]>([]);
  const [selectedProductNumber, setSelectedProductNumber] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [dtManufacturers, setDtManufacturers] = useState<Manufacturer[]>([]);
  const [selectedDtManufacturers, setSelectedDtManufacturers] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<any[]>([]); // Specify a more accurate type if possible
  const [resultData, setResultData] = useState<any[]>([]); // Specify a more accurate type if possible
  const [showTreeComponent, setShowTreeComponent] = useState<boolean>(false);
  const [kwdSearchType, setKwdSearchType] = useState<string>('0');
  const [showSetting, setShowSetting] = useState<boolean>(false);



  const handleKwdSearchTypeChange = (event: any) => {
    setKwdSearchType(event.target.value);
  };
  const searchParams = {
    keyword,
    kwdSearchType,
    selectedManufacturer,
    selectedEqType,
    selectedProductLine,
    selectedProductNumber,
    selectedDtManufacturers,
    setSnackbarMessage,
    setSnackbarOpen,
  };

  const onSuccess = (resultData: any[], dtResultdata: any[]) => {
    if (dtResultdata && dtResultdata.length > 0) {
      console.log('Processing dtResultdata:', dtResultdata);

      // Update state with dtResultdata
      setDtManufacturers(dtResultdata);
      setIsDialogOpen(true);
      return;
    }

    if (resultData && resultData.length > 0) {
      console.log('Processing resultData:', resultData);

      const treeHierarchy = transformToTreeData(resultData);
      setResultData(resultData);

      console.log('treeHierarchy:', treeHierarchy);
      setTreeData(treeHierarchy);


      if (treeHierarchy.length > 0) {
        setShowTreeComponent(true);
      } else {
        setSnackbarMessage('No relevant tree data found');
        setSnackbarOpen(true);
        setShowTreeComponent(false);
      }
    } else {
      setSnackbarMessage('No results found');
      setSnackbarOpen(true);
      setShowTreeComponent(false);
    }
  };

  const onError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    const fetchManufacturers = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${BASE_URL}GetLibraryAvailableManufacturersNew`, {
          Email: "",
          SubNo: "000000000000000000001234",
          FullLibrary: false,
          Models: null,
        });
        const manufacturersData = response.data.Data;
        console.log('main', manufacturersData)
        setManufacturers(manufacturersData);

        if (manufacturersData.length === 1) {
          setSelectedManufacturer(manufacturersData[0].MfgAcronym);
        }
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
      }
      setLoading(false);
    };
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (selectedManufacturer) {
      const fetchEqTypes = async () => {
        setLoading(true);
        try {
          const response = await axios.post(`${BASE_URL}GetLibraryAvailableEqTypesNew`, {
            Email: "",
            Subno: "000000000000000000001234",
            ActualMfgAcronym: selectedManufacturer,
            FullLibrary: false,
            Models: null,
          });
          const eqTypesData = response.data.Data;
          setEqTypes(eqTypesData);

          // Automatically select if only one equipment type is available
          if (eqTypesData.length === 1) {
            setSelectedEqType(eqTypesData[0]);
          }
        } catch (error) {
          console.error('Error fetching equipment types:', error);
        }
        setLoading(false);
      };
      fetchEqTypes();
    }
  }, [selectedManufacturer]);


  useEffect(() => {
    if (selectedManufacturer && selectedEqType) {
      const fetchProductLine = async () => {
        setLoading(true);
        try {
          const response = await axios.post(`${BASE_URL}/GetLibraryAvailableProdLinesNew`, {
            Email: "",
            SubNo: "000000000000000000001234",
            ActualMfgAcronym: selectedManufacturer,
            EqTypeToGetFor: selectedEqType,
            FullLibrary: false,
          });
          const productLineData = response.data.Data;
          setProductLine(productLineData);

          // Automatically select if only one product line is available
          if (productLineData.length === 1) {
            setSelectedProductLine(productLineData[0]);
          }
        } catch (error) {
          console.error('Error fetching product line:', error);
        }
        setLoading(false);
      };
      fetchProductLine();
    }
  }, [selectedManufacturer, selectedEqType]);


  useEffect(() => {
    if (selectedManufacturer && selectedEqType && selectedProductLine) {
      const fetchProductNumber = async () => {
        setLoading(true);
        try {
          const response = await axios.post(`${BASE_URL}/GetLibraryAvailableProdNumbersNew`, {
            Email: "",
            SubNo: "000000000000000000001234",
            ActualMfgAcronym: selectedManufacturer,
            EqTypeToGetFor: selectedEqType,
            ProdLineToGetFor: selectedProductLine,
            FullLibrary: false,
          });
          const productNumberData = response.data.Data;
          console.log('pronumber', productNumberData)
          setProductNumber(productNumberData);

          // Automatically select if only one product number is available
          if (productNumberData.length === 1) {
            setSelectedProductNumber(productNumberData[0]);
          }
        } catch (error) {
          console.error('Error fetching product number:', error);
        }
        setLoading(false);
      };
      fetchProductNumber();
    }
  }, [selectedManufacturer, selectedEqType, selectedProductLine]);

  useEffect(() => {
    if (keyword) {
      const matchedManufacturers = manufacturers.filter((manufacturer) =>
        manufacturer.MfgAcronym.toLowerCase().includes(keyword.toLowerCase())
      );

      if (matchedManufacturers.length > 0) {
        console.log('Matched Manufacturers:', matchedManufacturers);
      } else {
        console.log('No matching manufacturers found');
      }
    }

  }, [keyword, manufacturers]);

  useEffect(() => {
    if (selectedManufacturer && selectedEqType && selectedProductLine && selectedProductNumber) {
      Search(searchParams, onSuccess, onError)
    }
  }, [selectedManufacturer && selectedEqType && selectedProductLine && selectedProductNumber])


  const handleManufacturerChange = (event: SelectChangeEvent<string>) => {
    setSelectedManufacturer(event.target.value);

    setSelectedEqType('');
    setSelectedProductLine('');
    setSelectedProductNumber('');
    setEqTypes([]);
    setProductLine([]);
    setProductNumber([]);
  };

  const handleEqTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedEqType(event.target.value);
    setSelectedProductLine('')
    setSelectedProductNumber('')
    setProductLine([])
    setProductNumber([])

  }
  const handleproductlinechange = (event: SelectChangeEvent<string>) => {
    setSelectedProductLine(event.target.value)
    setSelectedProductNumber('')
    setProductNumber([])

  }
  const handleproductnumber = (event: SelectChangeEvent<string>) => {
    setSelectedProductNumber(event.target.value)

  }
  const handleSettingClick = () => {
    setShowSetting(true)
  };
  const backfromsetting = () => {
    setShowSetting(false)
  }
  const handleClick = () => {
    window.open(data.logourl, '_blank');
  };
  const handleManufacturerSelection = (manufacturer: string) => {
    setSelectedDtManufacturers((prevSelected) =>
      prevSelected.includes(manufacturer)
        ? prevSelected.filter((item) => item !== manufacturer)
        : [...prevSelected, manufacturer]
    );
  };
  const handleDialogSubmit = () => {
    console.log('Selected Manufacturers:', selectedDtManufacturers);
    setIsDialogOpen(false);
    setSelectedDtManufacturers([])
    handlesearch()
  };

  const handledialogclose = () => {
    setIsDialogOpen(false)
    setSelectedDtManufacturers([])
  }

  const handlebuttonclick = () => {
    setSnackbarOpen(false)

  }

  const CustomTypography: React.FC<React.PropsWithChildren<TypographyProps>> = ({ children, ...props }) => (
    <Typography variant="body2" sx={{ fontSize: '12px', fontFamily: ['Segoe UI', 'sans-serif'] }} {...props}>
      {children}
    </Typography>
  );

  useTheme(data.colortheme)

  const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };
  const handlesearch = () => {
    Search(searchParams, onSuccess, onError);
  };

  const handleBackClick = () => {
    setShowTreeComponent(false);
  };
  return (
    <div
    className='container'
      style={{
        backgroundColor: 'var(--bg-color)',
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        overflowY: 'auto',
        justifyContent: 'flex-start',
        fontFamily: 'Segoe UI, sans-serif',
        alignItems: 'center',
        color: 'var(--font-color)',
        boxSizing: 'border-box',
        padding: '9px',
      }}
    >
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={isDialogOpen}
        onClose={() => handledialogclose()}
        sx={{
          fontSize: { xs: '10px', sm: '12px' },
          fontFamily: '"Segoe UI", sans-serif'
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '10px', sm: '12px' },
            fontFamily: '"Segoe UI", sans-serif'
          }}
        >
          Select Manufacturers
        </DialogTitle>
        <DialogContent
          sx={{
            fontSize: { xs: '10px', sm: '12px' },
            fontFamily: '"Segoe UI", sans-serif'
          }}
        >
          <FormControl
            component="fieldset"
            sx={{
              fontSize: { xs: '10px', sm: '12px' },
              fontFamily: '"Segoe UI", sans-serif'
            }} >
            <FormGroup
              sx={{
                fontSize: { xs: '10px', sm: '12px' },
                fontFamily: '"Segoe UI", sans-serif'
              }}
            >
              {dtManufacturers.map((manufacturer, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedDtManufacturers.includes(manufacturer.MfgAcronym)}
                      onChange={() => handleManufacturerSelection(manufacturer.MfgAcronym)}
                      sx={{
                        fontSize: { xs: '10px', sm: '12px' },
                        fontFamily: '"Segoe UI", sans-serif'
                      }}
                    />
                  }
                  label={manufacturer.Manufacturer}
                  sx={{
                    fontSize: { xs: '10px', sm: '12px' },
                    fontFamily: '"Segoe UI", sans-serif'
                  }}
                />
              ))}
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handledialogclose()}
            sx={{
              fontSize: { xs: '10px', sm: '12px' },
              fontFamily: '"Segoe UI", sans-serif'
            }} >
            Cancel
          </Button>
          <Button
            onClick={() => handleDialogSubmit()}
            sx={{
              fontSize: { xs: '10px', sm: '12px' },
              fontFamily: '"Segoe UI", sans-serif'
            }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {!showTreeComponent && !showSetting ? (

        <>
          <Box
            sx={{
              position: 'relative',
              top: '0px',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              width: '100%',
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <>
                <img src="./assets/Icons/NetZoom_Settings_128x128.svg" alt="" title='Setting' style={{ padding: 0, maxWidth: '20px', cursor: 'pointer', color: 'var(--font-color)' }} onClick={handleSettingClick} />
                <Typography sx={{ marginLeft: '8px', whiteSpace: 'nowrap', fontSize: '12px' }}>Visit</Typography>
                <Typography
                  title="Visit VisioStencil website"
                  sx={{
                    marginLeft: '8px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    whiteSpace: 'nowrap',
                    fontSize: '12px',
                  }}
                  onClick={handleClick} >
                  VisioStencils.com
                </Typography>
              </>
            </Box>
          </Box>
          <Box
            component="form"
            sx={{
              width: '101%',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '12px'
            }}
            noValidate
            autoComplete="off"
          >
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', width: '100%' }}>
              <div style={{ flexGrow: 1, padding: '1px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '10px' }}> {/* Adjust the minHeight value as needed */}
                  <TextField
                    id="outlined-basic"
                    label={<CustomTypography>Search</CustomTypography>}
                    variant="outlined"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="By keyword"
                    InputLabelProps={{ style: { color: 'var(--font-color)' } }}
                    InputProps={{
                      style: {
                        color: 'var(--font-color)',
                        fontSize: '12px',
                        padding: '10px',
                      },
                    }}
                    onKeyPress={(event) => {
                      if (event.key === 'Enter' && keyword.trim() !== '') {
                        handlesearch();
                      }
                    }}
                    fullWidth
                    sx={{
                      '.MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'var(--font-color)',
                          padding: '10px',
                        },
                        '&:hover fieldset': {
                          borderColor: 'var(--font-color)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'var(--font-color)',
                        },
                        '& .MuiInputBase-input': {
                          padding: '10px',
                          boxSizing: 'border-box',
                        },
                      },
                      fontSize: '12px',
                      color: 'var(--font-color)',
                    }}
                  />
                </div>

                {keyword ? (
                  <Snackbar
                    open={snackbarOpen}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  >
                    <Alert
                      onClose={handleSnackbarClose}
                      severity="info"
                      sx={{ width: '100%' }}
                      action={
                        <Button color="inherit" size="small" onClick={handlebuttonclick}>
                          OK
                        </Button>
                      }>

                      {snackbarMessage}
                    </Alert>
                  </Snackbar>
                ) : (
                  <Snackbar
                    open={snackbarOpen}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  >
                    <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                      {snackbarMessage}
                    </Alert>
                  </Snackbar>
                )}
              </div>

              <div style={{ paddingLeft: '0px' }}>
                <img
                  src="./assets/Icons/Search_128x128.svg"
                  alt="Search"
                  onClick={handlesearch}
                  style={{
                    cursor: 'pointer',
                    width: '40px',
                    height: '20px',
                    color: 'var(font-color)',
                  }}
                />
              </div>
            </div>

            <div style={{ minHeight: '30px' }}>
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  row
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'var(--font-color)',
                    fontSize: '12px'
                  }}
                  onChange={handleKwdSearchTypeChange}
                  value={kwdSearchType}
                >
                  <FormControlLabel
                    sx={{ fontSize: '12px' }}
                    control={<Radio sx={{ color: 'var(--font-color)', fontSize: '12px' }} color='default' value="0" />}
                    label='Any Word'
                  />
                  <FormControlLabel
                    control={<Radio sx={{ color: 'var(--font-color)' }} color='default' value="1" />}
                    label='All Words'
                  />
                </RadioGroup>
              </FormControl>
            </div>

            <div style={{ minHeight: '10px' }}>
              <FormControl fullWidth variant="outlined" sx={{ mt: 1, height: 'auto' }}>
                <InputLabel
                  sx={{
                    color: 'var(--font-color)',
                    fontSize: '12px',
                    height: 'auto',  // Adjust the height here
                  }}
                  shrink
                >
                  Manufacturers [{manufacturers.length}]
                </InputLabel>
                <Select
                  displayEmpty
                  value={selectedManufacturer}
                  onChange={handleManufacturerChange}
                  className='nz-searchcombo'
                  input={
                    <OutlinedInput
                      notched
                      label={`Manufacturers [${manufacturers.length}]`}
                      sx={{
                        color: 'var(--font-color)',
                        fontSize: '12px',
                        height: 'auto',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--font-color)',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '12px',
                          padding: '12px',
                        },
                      }}
                    />
                  }
                  renderValue={(selected) => {
                    if (!selected) {
                      return <h1>All</h1>;
                    }
                    const selectedManufacturer = manufacturers.find(manufacturer => manufacturer.MfgAcronym === selected);
                    return selectedManufacturer ? selectedManufacturer.Manufacturer : 'All';
                  }}
                >
                  {manufacturers.length > 0 && (
                    <MenuItem value="" sx={{ fontSize: '12px' }}>
                      <h1>All</h1>
                    </MenuItem>
                  )}
                  {manufacturers.length > 0 ? (
                    manufacturers.map((manufacturer) => (
                      <MenuItem
                        key={manufacturer.MfgAcronym}
                        value={manufacturer.MfgAcronym}
                        sx={{ fontSize: '12px', fontFamily: 'Segoe UI, sans-serif', color: 'var(--black-font)' }}
                      >
                        {manufacturer.Manufacturer}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No Manufacturers Available</MenuItem>
                  )}
                </Select>
              </FormControl>

            </div>
            <div>

              <FormControl fullWidth variant="outlined" sx={{ mt: 2, height: 'auto' }}>
                <InputLabel sx={{ color: 'var(--font-color)', fontSize: '12px' }} shrink>
                  Equipment Types [{eqTypes.length}]
                </InputLabel>
                <Select
                  displayEmpty
                  value={selectedEqType}
                  className='nz-searchcombo'
                  onChange={handleEqTypeChange}
                  input={
                    <OutlinedInput
                      notched
                      label={`Equipment Types [${eqTypes.length}]`}
                      sx={{
                        color: 'var(--font-color)',
                        fontSize: '12px',
                        height: 'auto',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--font-color)',
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '12px',
                          padding: '12px',
                        },
                      }}
                    />
                  }
                  renderValue={(selected) => {
                    if (!selected) {
                      return <h1>All</h1>;
                    }
                    return selected as string; 
                  }}
                >
                  {eqTypes.length > 0 && (
                    <MenuItem value="" sx={{ fontSize: '12px' }}>
                      <h1>All</h1>
                    </MenuItem>
                  )}
                  {eqTypes.length > 0 ? (
                    eqTypes.map((eqtype: any) => (
                      <MenuItem
                        key={eqtype} // Ensure key is a string or number
                        value={eqtype} // Ensure value matches the type of selectedEqType
                        sx={{ fontSize: '12px', fontFamily: 'Segoe UI, sans-serif', color: 'var(--black-font)' }}
                      >
                        {eqtype}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled sx={{ fontSize: '12px', fontFamily: 'Segoe UI, sans-serif' }}>
                      No Equipment Types Available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </div>


            <div>

              <FormControl fullWidth variant="outlined" sx={{ mt: 2, height: 'auto' }}>
                <InputLabel
                  sx={{ color: 'var(--font-color)', fontSize: '12px' }}
                  shrink
                >
                  Product Lines [{productLine.length}]
                </InputLabel>
                <Select
                  displayEmpty
                  value={selectedProductLine}
                  className='nz-searchcombo'
                  onChange={handleproductlinechange}
                  input={<OutlinedInput notched label=" Product Lines [0]"
                    sx={{
                      color: 'var(--font-color)',
                      fontSize: '12px',
                      height: 'auto',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--font-color)',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '12px',
                        padding: '12px',
                      },
                    }}
                  />}

                  renderValue={(selected) => {
                    if (!selected) {
                      return <h1>All</h1>
                    }
                    return selected as string
                  }}
                >
                  {productLine.length > 0 && (

                    <MenuItem value="" sx={{ fontSize: '12px' }}>
                      <h1>All</h1>
                    </MenuItem>
                  )}
                  {productLine.length > 0 ? (
                    productLine.map((productLine :any) => (
                      <MenuItem key={productLine} value={productLine} sx={{ fontSize: '12px', fontFamily: 'Segoe UI, sans-serif', color: 'var(--black-font)' }}>
                        {productLine}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled sx={{ fontSize: '12px', fontFamily: 'Segoe UI, sans-serif' }}>No product line available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </div>
            <div>
              <FormControl fullWidth variant="outlined" sx={{ mt: 2, height: 'auto' }}>
                <InputLabel
                  sx={{ color: 'var(--font-color)', fontSize: '12px' }}
                  shrink
                >
                  Product Numbers [{productNumber.length}]
                </InputLabel>
                <Select
                  displayEmpty
                  value={selectedProductNumber}
                  onChange={handleproductnumber}
                  className='nz-searchcombo'
                  input={<OutlinedInput notched label="Product Numbers [0]"
                    sx={{
                      color: 'var(--font-color)',
                      fontSize: '12px',
                      height: 'auto',
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--font-color)',
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '12px',
                        padding: '12px',

                      },
                    }}
                  />}
                  renderValue={(Pnumberselected) => {
                    if (!Pnumberselected) {
                      return <h1>All</h1>
                    }
                    return Pnumberselected as string
                  }}
                >
                  {productNumber.length > 0 && (

                    <MenuItem value="" sx={{ fontSize: '12px' }}>
                      <h1>All</h1>
                    </MenuItem>
                  )}
                  {productNumber.length > 0 ? (
                    productNumber.map((pnumber:any) => (
                      <MenuItem key={pnumber} value={pnumber} sx={{ fontSize: '12px', fontFamily: 'Segoe UI, sans-serif', color: 'var(--black-font)' }}>
                        {pnumber}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled sx={{ fontSize: '12px' }}>No Product number Available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </div>

          </Box>

          <Typography
            sx={{
              marginTop: '20px',
              fontSize: { xs: '12px', sm: '15px' },
              fontWeight: 'bold',
              textAlign: 'center',
              fontFamily: 'Segoe UI, sans-serif',
              padding: '0 12px',
            }}
          >
            Now you can create professional quality Visio Diagrams and PowerPoint Presentations using High Quality Shapes and Stencils.
          </Typography>
        </>

      ) : showSetting ? (
        <>
          <Box
            sx={{
              width: '100%',
              height: '100vh',
              marginTop: '0px',
              padding: '0px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', }}>
              <img
                src="./assets/Icons/Left_128x128.svg"
                alt="Back"
                onClick={backfromsetting}
                title='Back'
                style={{
                  width: '18px',
                  cursor: 'pointer',
                  height: '20px',
                  marginRight: '4px'
                }}
              />

              <Typography sx={{ marginLeft: '6px', whiteSpace: 'nowrap', fontSize: '12px' }}>Visit</Typography>
              <Typography
                  title="Visit VisioStencil website"
                sx={{
                  marginLeft: '8px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  whiteSpace: 'nowrap',
                  fontSize: '12px'
                }}
                onClick={handleClick}>
                VisioStencils.com
              </Typography>
            </Box>
          </Box>
          <Setting />
        </>

      ) : (
        <Box
          sx={{
            display: showTreeComponent ? 'block' : 'none',
            width: '100%',
            height: '100vh',
            marginTop: '0px',
            padding: '0px',
          }}
        >
          {showTreeComponent && treeData.length > 0 ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', }}>
                <img
                  src="./assets/Icons/Left_128x128.svg"
                  alt="Back"
                  onClick={handleBackClick}
                  title='Back'
                  style={{
                    width: '18px',
                    cursor: 'pointer',
                    height: '20px',
                    marginRight: '4px'
                  }}
                />

                <Typography sx={{ marginLeft: '8px', whiteSpace: 'nowrap', fontSize: '12px' }}>Visit</Typography>
                <Typography
                  title="Visit VisioStencil website"
                  sx={{
                    marginLeft: '8px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    whiteSpace: 'nowrap',
                    fontSize: '12px'
                  }}
                  onClick={handleClick}>
                  VisioStencils.com
                </Typography>
              </Box>
              <Treedata treeData={treeData} />
            </>
          ) : (
            <div>No data available for the tree.</div>
          )}
        </Box>
      )}
    </div>
  );
}
export default SearchComponent
