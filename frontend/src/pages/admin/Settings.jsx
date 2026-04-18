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
import { showToast, showAlert } from '../../utils/swal'; // Import thêm showAlert

export default function Settings() {
  const [tabIndex, setTabIndex] = useState(0);

  // States lưu cấu hình
  const [dormConfig, setDormConfig] = useState({
    electricityPrice: 3500,
    waterPrice: 15000,
    defaultDeposit: 1500000,
  });

  const [account, setAccount] = useState({
    fullName: 'Admin KTX',
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

  // 1. LẤY DỮ LIỆU TỪ BACKEND KHI LOAD TRANG
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/settings')
      .then(res => {
        if (res.data.dormConfig) setDormConfig(res.data.dormConfig);
        if (res.data.systemConfig) setSystemConfig(res.data.systemConfig);
        if (res.data.account) setAccount({ ...res.data.account, oldPassword: '', newPassword: '' });
      })
      .catch(err => console.error("Lỗi tải cài đặt:", err));
  }, []);

  // 2. LƯU CẤU HÌNH KTX
  const handleSaveDormConfig = () => {
    axios.put('http://127.0.0.1:5000/api/settings/dorm', dormConfig)
      .then(res => showToast(res.data.message || 'Đã lưu cấu hình Ký túc xá!', 'success'))
      .catch(err => showAlert('Lỗi', err.response?.data?.error || 'Có lỗi xảy ra', 'error'));
  };

  // 3. LƯU TÀI KHOẢN ADMIN
  const handleSaveAccount = () => {
    axios.put('http://127.0.0.1:5000/api/settings/account', account)
      .then(res => {
        showToast(res.data.message || 'Cập nhật tài khoản thành công!', 'success');
        setAccount({ ...account, oldPassword: '', newPassword: '' }); // Xóa trắng ô password sau khi lưu
      })
      .catch(err => showAlert('Lỗi', err.response?.data?.error || 'Có lỗi xảy ra', 'error'));
  };

  // 4. LƯU CÔNG TẮC HỆ THỐNG (Tự động gọi API khi gạt)
  const handleSystemSwitch = (field, value) => {
    const newConfig = { ...systemConfig, [field]: value };
    setSystemConfig(newConfig); // Cập nhật giao diện trước cho mượt
    
    axios.put('http://127.0.0.1:5000/api/settings/system', newConfig)
      .then(res => showToast(res.data.message || 'Đã cập nhật hệ thống!', 'success'))
      .catch(err => {
        showAlert('Lỗi', err.response?.data?.error || 'Có lỗi xảy ra', 'error');
        setSystemConfig(systemConfig); // Lỗi thì trả về trạng thái cũ
      });
  };
  
  return (
    <Box sx={{ p: 1, maxWidth: '900px', margin: '0 auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" color="#1e3a8a" gutterBottom>Cài đặt Hệ thống</Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Tùy chỉnh các thông số vận hành, tài khoản và tự động hóa
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
            <Tab icon={<BusinessIcon sx={{ mr: 1.5 }}/>} iconPosition="start" label="Cấu hình Chung" />
            <Tab icon={<SecurityIcon sx={{ mr: 1.5 }}/>} iconPosition="start" label="Tài khoản & Bảo mật" />
            <Tab icon={<TuneIcon sx={{ mr: 1.5 }}/>} iconPosition="start" label="Hệ thống & Tự động" />
          </Tabs>
        </Box>

        {/* Content Area */}
        <Box sx={{ flexGrow: 1, p: { xs: 3, md: 5 } }}>
          
          {/* TAB 1: CẤU HÌNH KTX */}
          {tabIndex === 0 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>Đơn giá & Chi phí mặc định</Typography>
              <Stack spacing={3}>
                <TextField 
                  label="Đơn giá Điện" type="number" 
                  value={dormConfig.electricityPrice} onChange={(e) => setDormConfig({...dormConfig, electricityPrice: e.target.value})}
                  InputProps={{ endAdornment: <InputAdornment position="end">VNĐ / kWh</InputAdornment> }} fullWidth 
                />
                <TextField 
                  label="Đơn giá Nước" type="number" 
                  value={dormConfig.waterPrice} onChange={(e) => setDormConfig({...dormConfig, waterPrice: e.target.value})}
                  InputProps={{ endAdornment: <InputAdornment position="end">VNĐ / m3</InputAdornment> }} fullWidth 
                />
                <Divider />
                <TextField 
                  label="Tiền cọc mặc định (Áp dụng khi duyệt HĐ)" type="number" 
                  value={dormConfig.defaultDeposit} onChange={(e) => setDormConfig({...dormConfig, defaultDeposit: e.target.value})}
                  InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }} fullWidth 
                />
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveDormConfig} sx={{ alignSelf: 'flex-start', bgcolor: '#1c3d8c', px: 4, py: 1.5, borderRadius: '8px' }}>
                  Lưu Cấu Hình
                </Button>
              </Stack>
            </Box>
          )}

          {/* TAB 2: TÀI KHOẢN */}
          {tabIndex === 1 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>Thông tin Quản trị viên</Typography>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Họ và tên" value={account.fullName} onChange={(e) => setAccount({...account, fullName: e.target.value})} fullWidth />
                  <TextField label="Số điện thoại" value={account.phone} onChange={(e) => setAccount({...account, phone: e.target.value})} fullWidth />
                </Stack>
                <TextField label="Email" type="email" value={account.email} onChange={(e) => setAccount({...account, email: e.target.value})} fullWidth />
                
                <Typography variant="subtitle2" color="#64748b" mt={2} mb={-1}>Đổi mật khẩu</Typography>
                <TextField label="Mật khẩu hiện tại" type="password" value={account.oldPassword} onChange={(e) => setAccount({...account, oldPassword: e.target.value})} fullWidth />
                <TextField label="Mật khẩu mới" type="password" value={account.newPassword} onChange={(e) => setAccount({...account, newPassword: e.target.value})} fullWidth />
                
                <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSaveAccount} sx={{ alignSelf: 'flex-start', px: 4, py: 1.5, borderRadius: '8px' }}>
                  Cập nhật Tài khoản
                </Button>
              </Stack>
            </Box>
          )}

          {/* TAB 3: HỆ THỐNG */}
          {tabIndex === 2 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={3}>Tự động hóa & Hiệu năng</Typography>
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                  <FormControlLabel 
                    control={<Switch checked={systemConfig.autoBilling} onChange={(e) => handleSystemSwitch('autoBilling', e.target.checked)} color="primary" />} 
                    label={<Box><Typography fontWeight="bold">Tự động tạo hóa đơn</Typography><Typography variant="body2" color="text.secondary">Hệ thống sẽ tự động quét và tạo Hóa đơn vào ngày 01 hàng tháng.</Typography></Box>} 
                  />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                  <FormControlLabel 
                    control={<Switch checked={systemConfig.emailNotifications} onChange={(e) => handleSystemSwitch('emailNotifications', e.target.checked)} color="primary" />} 
                    label={<Box><Typography fontWeight="bold">Gửi Email thông báo</Typography><Typography variant="body2" color="text.secondary">Gửi mail cho SV khi có Hợp đồng mới hoặc Hóa đơn cần thanh toán.</Typography></Box>} 
                  />
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#fff1f2', borderColor: '#ffe4e6' }}>
                  <FormControlLabel 
                    control={<Switch checked={systemConfig.maintenanceMode} onChange={(e) => handleSystemSwitch('maintenanceMode', e.target.checked)} color="error" />} 
                    label={<Box><Typography fontWeight="bold" color="error">Bảo trì hệ thống (Maintenance Mode)</Typography><Typography variant="body2" color="text.secondary">Tạm thời chặn sinh viên đăng nhập để bảo trì dữ liệu.</Typography></Box>} 
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