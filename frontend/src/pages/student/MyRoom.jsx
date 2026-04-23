import React, { useState, useEffect } from 'react';
import { 
  Button, Typography, Box, Grid, Card, CardContent, Stack, Avatar, Divider, 
  CircularProgress, Chip, Paper 
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import WeekendIcon from '@mui/icons-material/Weekend';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MyRoom() {
  const navigate = useNavigate();
  const currentStudentId = localStorage.getItem('user_id'); 

  // FIX LỖI REACT: Khởi tạo state ngay từ đầu dựa vào việc có ID hay không
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(currentStudentId ? true : false);
  const [error, setError] = useState(currentStudentId ? null : "User session not found.");

  useEffect(() => {
    // Chỉ gọi API khi thực sự có ID
    if (currentStudentId) {
      axios.get(`http://127.0.0.1:5000/api/students/my-room/${currentStudentId}`)
        .then(response => {
          setData(response.data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.response?.data?.error || "Error fetching data.");
          setLoading(false);
        });
    }
  }, [currentStudentId]);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) {
    return <Box sx={{ width: '100%', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
  }

  
  if (error || !data) {
    return (
      <Box sx={{ width: '100%', minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: '20px', textAlign: 'center', border: '1px solid #e2e8f0', maxWidth: '600px', bgcolor: 'white' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#fef3c7', color: '#d97706', margin: '0 auto', mb: 3 }}><MeetingRoomIcon sx={{ fontSize: 40 }} /></Avatar>
          <Typography variant="h5" fontWeight="800" color="#1e293b" mb={2}>Room Information Not Found</Typography>
          <Typography variant="body1" color="#64748b" mb={4} sx={{ fontSize: '1.1rem' }}>
            You do not have an active contract or room yet. Please register for a room now!
          </Typography>
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/student/dashboard')} sx={{ bgcolor: '#1c3d8c', borderRadius: '10px', px: 4, py: 1.5, fontWeight: 'bold', textTransform: 'none' }}>Go to Dashboard</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h3" fontWeight="900" color="#1e3a8a" gutterBottom>My Room</Typography>
          <Typography variant="h6" color="#64748b" fontWeight="normal">Official accommodation information based on your active contract</Typography>
        </Box>
        <Chip label="Contract Verified" color="success" sx={{ fontWeight: 'bold', px: 2, py: 2.5, borderRadius: '8px' }} />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>
            {/* CARD: ROOM INFO */}
            <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <MeetingRoomIcon sx={{ color: '#1c3d8c', fontSize: 32 }} />
                  <Typography variant="h5" fontWeight="bold">Room Details</Typography>
                </Stack>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <Box component="img" src={data.room_info.image_url ? `http://127.0.0.1:5000${data.room_info.image_url}` : "https://placehold.co/600x400?text=No+Image"} sx={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Typography variant="subtitle2" color="#64748b" textTransform="uppercase">Assigned Room</Typography>
                    <Typography variant="h4" fontWeight="900" color="#1c3d8c" mb={2}>{data.room_info.name}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Stack direction="row" justifyContent="space-between">
                        <Box><Typography variant="body2" color="#64748b">Rental Fee</Typography><Typography variant="h6" fontWeight="bold" color="#ea580c">{formatCurrency(data.room_info.price)}</Typography></Box>
                        <Box sx={{ textAlign: 'right' }}><Typography variant="body2" color="#64748b">Current Occupancy</Typography><Typography variant="h6" fontWeight="bold">{data.room_info.current_tenants} / {data.room_info.capacity}</Typography></Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* CARD: ROOMMATES */}
            <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={4}><GroupIcon sx={{ color: '#1c3d8c', fontSize: 32 }} /><Typography variant="h5" fontWeight="bold">Roommates</Typography></Stack>
                <Grid container spacing={3}>
                  {data.roommates.map((mate) => (
                    <Grid item xs={12} sm={6} key={mate.id}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: mate.is_me ? '#f0f9ff' : 'white' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: mate.is_me ? '#1c3d8c' : '#f1f5f9', color: mate.is_me ? 'white' : '#1c3d8c' }}>{mate.name.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{mate.name} {mate.is_me && "(Me)"}</Typography>
                            <Typography variant="caption" color="#64748b" display="block">{mate.email}</Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: CONTRACT & DEVICES */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            {/* CARD: CONTRACT DETAILS */}
            <Card sx={{ borderRadius: '16px', bgcolor: '#1c3d8c', color: 'white', boxShadow: '0 10px 20px rgba(28, 61, 140, 0.2)' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}><DescriptionIcon /><Typography variant="h6" fontWeight="bold">Contract Terms</Typography></Stack>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Contract ID</Typography>
                    <Typography variant="body1" fontWeight="bold">#DORM-{data.contract_info.contract_id}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box><Typography variant="caption" sx={{ opacity: 0.8 }}>Start Date</Typography><Typography variant="body2" fontWeight="bold">{data.contract_info.start_date}</Typography></Box>
                    <Box sx={{ textAlign: 'right' }}><Typography variant="caption" sx={{ opacity: 0.8 }}>Expiry Date</Typography><Typography variant="body2" fontWeight="bold">{data.contract_info.end_date}</Typography></Box>
                  </Box>
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>Security Deposit</Typography>
                    <Typography variant="h6" fontWeight="bold">{formatCurrency(data.contract_info.deposit)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* CARD: DEVICES */}
            <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={4}><WeekendIcon sx={{ color: '#1c3d8c' }} /><Typography variant="h6" fontWeight="bold">Room Amenities</Typography></Stack>
                <Stack spacing={2}>
                  {data.devices.map((device) => (
                    <Box key={device.id} sx={{ p: 2, borderRadius: '10px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                      <Typography variant="subtitle2" fontWeight="800" color="#334155">{device.name}</Typography>
                      <Chip label={device.status === 'good' ? "Functional" : "Broken"} size="small" color={device.status === 'good' ? "success" : "error"} sx={{ mt: 1, fontWeight: 'bold' }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}