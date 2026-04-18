import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Paper, Grid, Card, CardContent, CardActions, 
  Chip, Stack, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, InputAdornment, Tooltip,
  Pagination, PaginationItem // <-- THÊM IMPORT MỚI
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import CampaignIcon from '@mui/icons-material/Campaign';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BuildIcon from '@mui/icons-material/Build';
import axios from 'axios';
import { showToast, showConfirm, showAlert } from '../../utils/swal';

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // THÊM MỚI: State cho Phân trang
  const [page, setPage] = useState(0);
  const rowsPerPage = 6; // Hiển thị 6 card mỗi trang để khớp với lưới 3 cột

  // States cho Form Thêm Sự kiện
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    type: 'info', 
    event_date: '' 
  });

  const fetchData = useCallback(() => {
    axios.get('http://127.0.0.1:5000/api/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error("Lỗi tải sự kiện:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = () => {
    setFormData({ 
      title: '', 
      description: '', 
      type: 'info', 
      event_date: new Date().toISOString().split('T')[0] 
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.event_date) {
      showAlert("Thiếu thông tin", "Vui lòng nhập đầy đủ tiêu đề, nội dung và ngày!", "warning");
      return;
    }

    axios.post('http://127.0.0.1:5000/api/events', formData)
      .then(() => {
        fetchData();
        handleClose();
        showToast('Đã đăng thông báo thành công!', 'success');
      })
      .catch(err => showAlert("Lỗi!", err.response?.data?.error, "error"));
  };

  const handleDelete = (id) => {
    showConfirm('Xóa thông báo?', 'Bạn có chắc muốn xóa bản tin này không?')
      .then((result) => {
        if (result.isConfirmed) {
          axios.delete(`http://127.0.0.1:5000/api/events/${id}`)
            .then(() => {
              fetchData();
              showToast('Đã xóa thông báo!', 'success');
            })
            .catch(err => showAlert("Lỗi!", err.response?.data?.error, "error"));
        }
      });
  };

  const getTypeConfig = (type) => {
    switch(type) {
      case 'warning': return { icon: <WarningAmberIcon />, color: '#d97706', bgcolor: '#fef3c7', label: 'Cảnh báo' };
      case 'maintenance': return { icon: <BuildIcon />, color: '#dc2626', bgcolor: '#fee2e2', label: 'Bảo trì' };
      default: return { icon: <InfoIcon />, color: '#2563eb', bgcolor: '#dbeafe', label: 'Thông tin' };
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 4 }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="#1e3a8a" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CampaignIcon fontSize="large" /> Bảng Tin & Sự Kiện
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
            Quản lý thông báo, lịch bảo trì và sự kiện nội bộ KTX
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} width={{ xs: '100%', md: 'auto' }}>
          <TextField 
              placeholder="Tìm thông báo..." size="small" value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }} // Reset về trang 1 khi tìm kiếm
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b' }}/></InputAdornment> }}
              sx={{ width: { xs: '100%', sm: '250px' }, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
          <Button variant="contained" startIcon={<AddAlertIcon />} onClick={handleOpen}
                  sx={{ bgcolor: '#1c3d8c', borderRadius: '10px', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#152b65' } }}>
            Đăng Thông Báo
          </Button>
        </Stack>
      </Stack>

      {/* Danh sách Sự kiện (Dạng Card Grid có áp dụng slice cho phân trang) */}
      {loading ? (
        <Typography align="center" sx={{ mt: 5, color: '#64748b' }}>Đang tải bảng tin...</Typography>
      ) : filteredEvents.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '20px', bgcolor: '#f8fafc' }}>
          <CampaignIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="#64748b">Chưa có thông báo nào!</Typography>
        </Paper>
      ) : (
        <Box>
          <Grid container spacing={3}>
            {filteredEvents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((event) => {
              const config = getTypeConfig(event.type);
              return (
                <Grid item xs={12} sm={6} md={4} key={event.event_id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: '0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } }}>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip icon={config.icon} label={config.label} size="small" 
                              sx={{ bgcolor: config.bgcolor, color: config.color, fontWeight: 'bold', '& .MuiChip-icon': { color: config.color } }} />
                        <Typography variant="caption" fontWeight="bold" color="#64748b">
                          {event.event_date}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight="800" color="#1e293b" gutterBottom>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="#475569" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 3, pb: 2, pt: 0, justifyContent: 'flex-end' }}>
                      <Tooltip title="Xóa bản tin này">
                        <IconButton onClick={() => handleDelete(event.event_id)} sx={{ color: '#ef4444', bgcolor: '#fee2e2', '&:hover': { bgcolor: '#fecaca' } }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* ========================================================= */}
          {/* PHÂN TRANG HIỆN ĐẠI THEO HÌNH MẪU */}
          {/* ========================================================= */}
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <Pagination 
              count={Math.ceil(filteredEvents.length / rowsPerPage) || 1} 
              page={page + 1} 
              onChange={(e, value) => setPage(value - 1)} 
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  components={{ 
                    previous: () => <span style={{ fontWeight: 'bold' }}>&lt; Prev</span>, 
                    next: () => <span style={{ fontWeight: 'bold' }}>Next &gt;</span> 
                  }}
                  sx={{
                    fontWeight: '600', color: '#64748b', fontSize: '14px', borderRadius: '12px', margin: '0 4px',
                    '&.Mui-selected': { 
                      bgcolor: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)', '&:hover': { bgcolor: '#f1f5f9' } 
                    },
                    '&.Mui-disabled': { opacity: 0.3 },
                    '&.MuiPaginationItem-previousNext': { 
                      color: '#94a3b8', bgcolor: 'transparent', 
                      '&:hover': { bgcolor: 'transparent', color: '#1e3a8a' } 
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>
      )}

      {/* Modal Thêm Thông Báo */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: '800', pt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddAlertIcon color="primary" /> Đăng Thông Báo Mới
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Tiêu đề thông báo (VD: Lịch cúp điện Tòa A)" name="title" value={formData.title} onChange={handleChange} fullWidth autoFocus />
            
            <Stack direction="row" spacing={2}>
              <TextField select label="Phân loại" name="type" value={formData.type} onChange={handleChange} fullWidth>
                <MenuItem value="info">Thông tin chung</MenuItem>
                <MenuItem value="warning">Cảnh báo (Mưa bão, An ninh)</MenuItem>
                <MenuItem value="maintenance">Bảo trì (Điện, Nước, Thang máy)</MenuItem>
              </TextField>
              <TextField label="Ngày diễn ra" name="event_date" type="date" value={formData.event_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>

            <TextField label="Nội dung chi tiết" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={4} placeholder="Nhập chi tiết thời gian, địa điểm, lưu ý cho sinh viên..." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} sx={{ color: '#64748b', fontWeight: 'bold' }}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#1c3d8c', borderRadius: '8px', px: 3 }}>
            Đăng Lên Bảng Tin
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}