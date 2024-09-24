import data from '../Link.json';
import { Typography, Box, Link, TextField, Button } from '@mui/material';
import useTheme from '../Components/Theme';

const Setting = () => {

  useTheme(data.colortheme);

  // const CustomTypography = ({ children, ...props }) => (
  //   <Typography variant="body2" sx={{ fontSize: '12px', fontFamily: ['Segoe UI', 'sans-serif'], }} {...props}>
  //     {children}
  //   </Typography>
  // );

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-color)',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        color: 'var(--font-color)',
        padding: '5px',
        boxSizing: 'border-box',
      }}
    >
      <Box 
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <Typography sx={{ fontSize: '12px' }}>
          The NetZoom device library contains the latest devices from over 5000 manufacturers. 
          To access the full library, you must purchase a subscription at 
          <Link href="https://www.VisioStencils.com" sx={{ fontSize: '12px', color: 'skyblue' }}> www.VisioStencils.com </Link> 
          and register it at the Service portal  
          <Link href="https://Service.NetZoom.com" sx={{ fontSize: '12px', color: 'skyblue' }}> https://Service.NetZoom.com </Link>.
        </Typography>
        <TextField 
          label= 'Portal Login Email'
          variant='outlined' 
          placeholder='Email address registered at service portal'
          InputLabelProps={{ style: { color: 'var(--font-color)' } }}
          InputProps={{
            style: { color: 'var(--font-color)', borderColor: 'var(--font-color)', fontSize: '12px' },
          }}
          sx={{
            '.MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'var(--font-color)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--font-color)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--font-color)',
              },
              '& .MuiInputBase-input': {
                padding: '12px 12px', 
              },
            },
          }}
          fullWidth
        />
        <TextField 
          label='Subscription Number' 
          variant='outlined' 
          placeholder='Enter Purchased Subscription number'
          InputLabelProps={{ style: { color: 'var(--font-color)' } }}
          InputProps={{
            style: { color: 'var(--font-color)', borderColor: 'var(--font-color)', fontSize: '12px' },
          }}
          sx={{
            '.MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'var(--font-color)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--font-color)',
              },
              '&.Mui-focused fieldset': {
              },
              '& .MuiInputBase-input': {
                padding: '12px 12px', 
              },
            },
          }}
          fullWidth
        />
      </Box>
      
      <Button 
        variant='contained' 
        size='small'
        sx={{ 
          padding: '5px 15px', 
          alignSelf: 'center',
          backgroundColor: '#87CEEB',
          color: 'var(--font-color)',
          '&:hover': {
            backgroundColor: '#87CEEB',
          },
        }}
      >
        Save
      </Button>
    </div>
  );
}

export default Setting;
