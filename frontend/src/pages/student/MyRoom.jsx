import React, { useState, useEffect } from 'react';
import { Button,
  Typography, Box, Grid, Card, CardContent, Stack, Avatar, Divider, CircularProgress, Chip, Paper, IconButton
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import WeekendIcon from '@mui/icons-material/Weekend';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import axios from 'axios';

export default function MyRoom() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentStudentId = 1; // Fix cứng ID để test

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/students/my-room/${currentStudentId}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setError(err.response?.data?.error || "Lỗi tải dữ liệu phòng.");
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return (
    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px', bgcolor: '#fef2f2', border: '1px dashed #fca5a5' }}>
      <Typography color="error" fontWeight="bold">{error}</Typography>
    </Paper>
  );

  const { room_info, roommates, devices } = data;

  // Xử lý đường dẫn ảnh cover
  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1522771731570-869b22258873?q=80&w=2000&auto=format&fit=crop"; // Ảnh mặc định xịn xò
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:5000/${url.replace(/^\/+/, '')}`;
  };

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      
      {/* ========================================== */}
      {/* HEADER: DẠNG HERO BANNER SIÊU ĐẸP            */}
      {/* ========================================== */}
      <Card sx={{ borderRadius: '24px', mb: 4, overflow: 'visible', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        {/* Ảnh Cover */}
        <Box 
          sx={{ 
            height: '220px', 
            width: '100%', 
            backgroundImage: `url(${getImageUrl(room_info.image_url)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            position: 'relative'
          }}
        >
          {/* Lớp phủ Gradient cho chữ dễ đọc */}
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)', borderRadius: 'inherit' }} />
        </Box>

        <CardContent sx={{ px: { xs: 3, md: 5 }, pb: { xs: 3, md: 4 }, pt: 0, position: 'relative', mt: '-50px' }}>
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item>
              <Avatar sx={{ width: 100, height: 100, bgcolor: 'white', border: '4px solid white', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', color: '#1e3a8a' }}>
                <MeetingRoomIcon sx={{ fontSize: 50 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box sx={{ color: 'white', mb: 1.5 }}>
                <Typography variant="h3" fontWeight="900" sx={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                  {room_info.name}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                <Chip icon={<GroupIcon />} label={`Sức chứa: ${room_info.current_tenants} / ${room_info.capacity} người`} sx={{ bgcolor: '#eff6ff', color: '#1e3a8a', fontWeight: 'bold', fontSize: '14px', py: 2 }} />
                <Chip icon={<AttachMoneyIcon />} label={`Đơn giá: ${formatCurrency(room_info.price)} / tháng`} sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 'bold', fontSize: '14px', py: 2 }} />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* ========================================== */}
        {/* CỘT TRÁI: THÀNH VIÊN TRONG PHÒNG           */}
        {/* ========================================== */}
        <Grid item xs={12} md={7}>
          <Typography variant="h5" fontWeight="900" color="#1e293b" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonIcon sx={{ color: '#2563eb' }} fontSize="large" /> Thành viên ({roommates.length})
          </Typography>
          
          <Stack spacing={2.5}>
            {roommates.map((user) => (
              <Card 
                key={user.id} 
                elevation={0} 
                sx={{ 
                  borderRadius: '20px', 
                  border: '2px solid', 
                  borderColor: user.is_me ? '#bfdbfe' : '#f1f5f9', 
                  bgcolor: user.is_me ? '#f8fafc' : 'white',
                  transition: '0.3s',
                  '&:hover': { borderColor: '#93c5fd', boxShadow: '0 10px 20px rgba(0,0,0,0.03)', transform: 'translateY(-2px)' }
                }}
              >
                <CardContent sx={{ p: '24px !important' }}>
                  <Grid container alignItems="center" spacing={3}>
                    <Grid item>
                      <Avatar sx={{ bgcolor: user.is_me ? '#2563eb' : '#94a3b8', width: 64, height: 64, fontSize: '24px', fontWeight: 'bold' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                        <Typography variant="h6" fontWeight="800" color="#1e293b">{user.name}</Typography>
                        {user.is_me && <Chip label="Là bạn" size="small" sx={{ bgcolor: '#1e3a8a', color: 'white', fontWeight: 'bold', fontSize: '11px', height: '24px' }} />}
                      </Stack>
                      
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                          <EmailIcon sx={{ fontSize: 18 }} />
                          <Typography variant="body2" fontWeight="500">{user.email}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
                          <PhoneIcon sx={{ fontSize: 18 }} />
                          <Typography variant="body2" fontWeight="500">{user.phone}</Typography>
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* ========================================== */}
        {/* CỘT PHẢI: TRANG THIẾT BỊ TÀI SẢN           */}
        {/* ========================================== */}
        <Grid item xs={12} md={5}>
          <Typography variant="h5" fontWeight="900" color="#1e293b" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WeekendIcon sx={{ color: '#059669' }} fontSize="large" /> Tài sản & Thiết bị
          </Typography>

          <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <CardContent sx={{ p: 0 }}>
              {devices.length > 0 ? (
                <Stack divider={<Divider />}>
                  {devices.map((device, idx) => {
                    const isGood = device.status.toLowerCase() === 'good' || device.status.toLowerCase() === 'tốt';
                    return (
                      <Box key={idx} sx={{ p: 3, '&:hover': { bgcolor: '#f8fafc' }, transition: '0.2s' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="800" color="#334155" mb={0.5}>
                              {device.name}
                            </Typography>
                            <Typography variant="caption" color="#94a3b8" fontWeight="bold">
                              Ngày sắm: {device.purchase_date}
                            </Typography>
                          </Box>
                          
                          {/* ĐÃ CĂN CHỈNH LẠI CHIP TRẠNG THÁI ĐỂ KHÔNG BỊ DÍNH CHỮ */}
                          <Chip 
                            icon={isGood ? <CheckCircleIcon /> : <BuildCircleIcon />} 
                            label={isGood ? "Đang sử dụng tốt" : "Đang báo hỏng"} 
                            color={isGood ? "success" : "error"}
                            variant={isGood ? "outlined" : "filled"}
                            size="medium"
                            sx={{ fontWeight: 'bold', borderRadius: '8px' }}
                          />
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="#ef4444" sx={{ fontStyle: 'italic' }}>
                    Phòng hiện chưa được cập nhật dữ liệu thiết bị.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}