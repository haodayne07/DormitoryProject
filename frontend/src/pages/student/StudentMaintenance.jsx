import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Card, CardContent, Stack, Button, Chip, Avatar, 
  Divider, CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Paper, Grid
} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HandymanIcon from '@mui/icons-material/Handyman';
import axios from 'axios';

// IMPORT BỘ THÔNG BÁO ĐỒNG NHẤT VỚI ADMIN
import { showToast, showAlert } from '../../utils/swal';

export default function StudentMaintenance() {
  const [history, setHistory] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true); 
  
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ device_id: '', description: '' });

  const currentStudentId = 1; 

  const fetchData = useCallback(() => {
    axios.get(`http://127.0.0.1:5000/api/students/my-room/${currentStudentId}`)
      .then(res => {
        if (res.data && res.data.devices) {
          setDevices(res.data.devices);
        }
      })
      .catch(err => console.error("Lỗi lấy thiết bị:", err));

    axios.get(`http://127.0.0.1:5000/api/students/maintenance/${currentStudentId}`)
      .then(res => setHistory(res.data))
      .catch(err => {
        console.error("Lỗi lấy lịch sử:", err);
        setHistory([
          { id: 1, device_name: 'Điều hòa', description: 'Điều hòa không mát, chỉ ra gió', status: 'pending', date: '10/03/2026' },
          { id: 2, device_name: 'Vòi sen', description: 'Bị rỉ nước liên tục', status: 'completed', date: '01/03/2026' }
        ]);
      })
      .finally(() => setLoading(false));
  }, [currentStudentId]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!formData.device_id || !formData.description) {
      // SỬ DỤNG TOAST MỚI (Vàng)
      showToast('Vui lòng nhập đầy đủ thông tin!', 'warning');
      return;
    }
    setSubmitting(true);
    axios.post('http://127.0.0.1:5000/api/students/maintenance', {
      student_id: currentStudentId,
      ...formData
    })
    .then(() => {
      // SỬ DỤNG TOAST MỚI (Xanh lá - Chuyển động như Admin)
      showToast('Gửi yêu cầu báo cáo sự cố thành công!', 'success');
      setOpenModal(false);
      setFormData({ device_id: '', description: '' });
      setLoading(true); 
      fetchData();
    })
    .catch(err => {
      // SỬ DỤNG ALERT MỚI (Đỏ)
      showAlert("Lỗi hệ thống", err.response?.data?.error || err.message, "error");
    })
    .finally(() => setSubmitting(false));
  };

  const getStatusChip = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return <Chip icon={<PendingActionsIcon />} label="Đang chờ xử lý" size="small" sx={{ bgcolor: '#fef08a', color: '#ca8a04', fontWeight: 'bold' }} />;
      case 'processing': return <Chip icon={<HandymanIcon />} label="Đang sửa chữa" size="small" sx={{ bgcolor: '#bae6fd', color: '#0284c7', fontWeight: 'bold' }} />;
      case 'completed': return <Chip icon={<CheckCircleIcon />} label="Đã hoàn thành" size="small" sx={{ bgcolor: '#bbf7d0', color: '#16a34a', fontWeight: 'bold' }} />;
      default: return <Chip label={status} size="small" />;
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: '100%', pb: 5 }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: '#d97706', width: 60, height: 60, boxShadow: '0 4px 10px rgba(217,119,6,0.2)' }}>
            <BuildCircleIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="900" color="#1e3a8a">Báo cáo sự cố</Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mt: 0.5 }}>
              Gửi yêu cầu sửa chữa trang thiết bị trong phòng của bạn
            </Typography>
          </Box>
        </Stack>
        <Button 
          variant="contained" 
          startIcon={<AddCircleOutlineIcon />} 
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, borderRadius: '10px', fontWeight: 'bold', px: 3, py: 1.5, boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}
        >
          Báo cáo hỏng hóc
        </Button>
      </Stack>

      {/* LỊCH SỬ BÁO CÁO */}
      <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h6" fontWeight="900" color="#1e293b" mb={3}>Lịch sử yêu cầu của bạn</Typography>
          
          {history.length > 0 ? (
            <Grid container spacing={3} alignItems="stretch">
              {history.map((item, idx) => (
                <Grid item xs={12} md={6} key={idx} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={{ 
                    p: 3, 
                    borderRadius: '16px', 
                    border: '1px solid #f1f5f9', 
                    bgcolor: '#f8fafc',
                    width: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="subtitle2" color="#64748b" mb={0.5}>{item.date}</Typography>
                          <Typography variant="h6" fontWeight="bold" color="#1e293b">{item.device_name}</Typography>
                        </Box>
                        {getStatusChip(item.status)}
                      </Stack>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="body2" color="#475569" sx={{ wordBreak: 'break-word' }}>
                        <strong>Mô tả:</strong> {item.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Typography color="#94a3b8" fontWeight="bold">Bạn chưa có lịch sử báo cáo sự cố nào.</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* MODAL TẠO BÁO CÁO MỚI */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: '900', color: '#1e3a8a', borderBottom: '1px solid #f1f5f9', pb: 2 }}>
          Tạo báo cáo sự cố mới
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label="Chọn thiết bị đang hỏng"
              name="device_id"
              value={formData.device_id}
              onChange={handleChange}
              fullWidth
            >
              {devices.map((dev) => (
                <MenuItem key={dev.id} value={dev.id}>
                  {dev.name} - {dev.status === 'good' ? '(Đang tốt)' : '(Đang lỗi)'}
                </MenuItem>
              ))}
              {devices.length === 0 && <MenuItem disabled>Phòng bạn chưa có thiết bị nào</MenuItem>}
            </TextField>
            
            <TextField
              label="Mô tả chi tiết tình trạng hỏng hóc"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              placeholder="Ví dụ: Quạt kêu rất to và không quay tuýp năng..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => setOpenModal(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Hủy</Button>
          <Button variant="contained" color="error" disabled={submitting} onClick={handleSubmit} sx={{ fontWeight: 'bold', borderRadius: '8px', px: 3 }}>
            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}