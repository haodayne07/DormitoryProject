import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Tabs, Tab, Stack, TextField, 
  Button, Switch, FormControlLabel, Divider, InputAdornment 
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { showToast, showAlert } from '../../utils/swal'; 

export default function Settings() {
  const [tabIndex, setTabIndex] = useState(0);

  const [dormConfig, setDormConfig] = useState({
    electricityPrice: 3500,
    waterPrice: 15000,
    defaultDeposit: 1500000,
  });

  const [account, setAccount] = useState({
    fullName: 'Admin',
    email: 'admin@dormhub.com',
    phone: '0987654321',
    oldPassword: '',
    newPassword: ''
  });

  const [systemConfig, setSystemConfig] = useState({
    autoBilling: true,
    emailNotifications: false,
    maintenanceMode: false
  });

  const handleTabChange = (e, newValue) => setTabIndex(newValue);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/settings')
      .then(res => {
        if (res.data.dormConfig) setDormConfig(res.data.dormConfig);
        if (res.data.systemConfig) setSystemConfig(res.data.systemConfig);
        if (res.data.account) setAccount({ ...res.data.account, oldPassword: '', newPassword: '' });
      })
      .catch(err => console.error("Error loading settings:", err));
  }, []);

  const handleSaveDormConfig = () => {
    axios.put('http://127.0.0.1:5000/api/settings/dorm', dormConfig)
      .then(res => showToast(res.data.message || 'Dormitory configuration saved!', 'success'))
      .catch(err => showAlert('Error', err.response?.data?.error || 'An error occurred', 'error'));
  };

  const handleSaveAccount = () => {
    axios.put('http://127.0.0.1:5000/api/settings/account', account)
      .then(res => {
        showToast(res.data.message || 'Account updated successfully!', 'success');
        setAccount({ ...account, oldPassword: '', newPassword: '' }); 
      })
      .catch(err => showAlert('Error', err.response?.data?.error || 'An error occurred', 'error'));
  };

  const handleSystemSwitch = (field, value) => {
    const newConfig = { ...systemConfig, [field]: value };
    setSystemConfig(newConfig); 
    
    axios.put('http://127.0.0.1:5000/api/settings/system', newConfig)
      .then(res => showToast(res.data.message || 'System updated!', 'success'))
      .catch(err => {
        showAlert('Error', err.response?.data?.error || 'An error occurred', 'error');
        setSystemConfig(systemConfig); 
      });
  };
  
  return (
    <Box sx={{ p: 1, maxWidth: '900px', margin: '0 auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" color="#1e3a8a" gutterBottom>System Settings</Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Customize operational parameters, accounts, and automation
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: '16px', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '60vh', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        {/* Sidebar Tabs */}
        <Box sx={{ width: { xs: '100%', md: '250px' }, borderRight: { xs: 'none', md: '1px solid #f0f0f0' }, borderBottom: { xs: '1px solid #f0f0f0', md: 'none' } }}>
          <Tabs 
            orientation="vertical" 
            variant="scrollable" 
            value={tabIndex} 
            onChange={handleTabChange} 
            sx={{ '& .MuiTab-root': { alignItems: 'flex-start', py: 2, px: 3, fontWeight: 'bold', textTransform: 'none', minHeight: '60px' }, '& .Mui-selected': { bgcolor: '#f8fafc', color: '#1c3d8c' } }}
          >
            <Tab icon={<BusinessIcon sx={{ mr: 1.5 }}/>} iconPosition="start" label="General Configuration" />
            <Tab icon={<SecurityIcon sx={{ mr: 1.5 }}/>} iconPosition="start" label="Account & Security" />
            <Tab icon={<TuneIcon sx={{ mr: 1.5 }}/>} iconPosition="start" label="System & Automation" />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
          
          {}
          {tabIndex === 0 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>Default Prices & Fees</Typography>
              <Stack spacing={3}>
                <TextField 
                  label="Electricity Price" type="number" 
                  value={dormConfig.electricityPrice} onChange={(e) => setDormConfig({...dormConfig, electricityPrice: e.target.value})}
                  InputProps={{ endAdornment: <InputAdornment position="end">VND / kWh</InputAdornment> }} fullWidth 
                />
                <TextField 
                  label="Water Price" type="number" 
                  value={dormConfig.waterPrice} onChange={(e) => setDormConfig({...dormConfig, waterPrice: e.target.value})}
                  InputProps={{ endAdornment: <InputAdornment position="end">VND / m3</InputAdornment> }} fullWidth 
                />
                <Divider />
                <TextField 
                  label="Default Deposit (Applied upon contract approval)" type="number" 
                  value={dormConfig.defaultDeposit} onChange={(e) => setDormConfig({...dormConfig, defaultDeposit: e.target.value})}
                  InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }} fullWidth 
                />
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveDormConfig} sx={{ alignSelf: 'flex-start', bgcolor: '#1c3d8c', px: 4, py: 1.5, borderRadius: '8px' }}>
                  Save Configuration
                </Button>
              </Stack>
            </Box>
          )}

          {}
          {tabIndex === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>Administrator Information</Typography>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Full Name" value={account.fullName} onChange={(e) => setAccount({...account, fullName: e.target.value})} fullWidth />
                  <TextField label="Phone Number" value={account.phone} onChange={(e) => setAccount({...account, phone: e.target.value})} fullWidth />
                </Stack>
                <TextField label="Email" type="email" value={account.email} onChange={(e) => setAccount({...account, email: e.target.value})} fullWidth />
                
                <Typography variant="subtitle2" color="#64748b" mt={2} mb={-1}>Change Password</Typography>
                <TextField label="Current Password" type="password" value={account.oldPassword} onChange={(e) => setAccount({...account, oldPassword: e.target.value})} fullWidth />
                <TextField label="New Password" type="password" value={account.newPassword} onChange={(e) => setAccount({...account, newPassword: e.target.value})} fullWidth />
                
                <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSaveAccount} sx={{ alignSelf: 'flex-start', px: 4, py: 1.5, borderRadius: '8px' }}>
                  Update Account
                </Button>
              </Stack>
            </Box>
          )}

          {}
          {tabIndex === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>Automation & Performance</Typography>
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                  <FormControlLabel 
                    control={<Switch checked={systemConfig.autoBilling} onChange={(e) => handleSystemSwitch('autoBilling', e.target.checked)} color="primary" />} 
                    label={<Box><Typography fontWeight="bold">Auto-generate Bills</Typography><Typography variant="body2" color="text.secondary">The system will automatically scan and generate Bills on the 1st of every month.</Typography></Box>} 
                  />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                  <FormControlLabel 
                    control={<Switch checked={systemConfig.emailNotifications} onChange={(e) => handleSystemSwitch('emailNotifications', e.target.checked)} color="primary" />} 
                    label={<Box><Typography fontWeight="bold">Email Notifications</Typography><Typography variant="body2" color="text.secondary">Send emails to students for new Contracts or pending Bills.</Typography></Box>} 
                  />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff1f2', borderColor: '#ffe4e6' }}>
                  <FormControlLabel 
                    control={<Switch checked={systemConfig.maintenanceMode} onChange={(e) => handleSystemSwitch('maintenanceMode', e.target.checked)} color="error" />} 
                    label={<Box><Typography fontWeight="bold" color="error">System Maintenance (Maintenance Mode)</Typography><Typography variant="body2" color="text.secondary">Temporarily block student logins for data maintenance.</Typography></Box>} 
                  />
                </Paper>
              </Stack>
            </Box>
          )}

        </Box>
      </Paper>
    </Box>
  );
}