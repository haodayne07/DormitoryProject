import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Avatar, Stack, Button,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Tooltip, InputAdornment, TablePagination, MenuItem,
  Tabs, Tab, FormControl, Select, CircularProgress,
  Pagination, PaginationItem // <-- THÊM IMPORT MỚI
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

import { CiEdit, CiTrash } from "react-icons/ci";
import { showToast, showConfirm, showAlert } from '../../utils/swal';

export default function Maintenance() {
  const [tabIndex, setTabIndex] = useState(0);
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);

  const fetchIssues = () => {
    axios.get('http://127.0.0.1:5000/api/maintenance/list')
      .then(res => setIssues(res.data))
      .catch(err => console.error("Lỗi lấy danh sách sự cố:", err))
      .finally(() => setIssuesLoading(false));
  };

  const handleStatusChange = (issueId, newStatus) => {
    const oldIssues = [...issues];
    setIssues(issues.map(item => item.id === issueId ? { ...item, status: newStatus } : item));

    axios.put(`http://127.0.0.1:5000/api/maintenance/${issueId}`, { status: newStatus })
      .then(() => {
        showToast('Đã cập nhật trạng thái!', 'success');
        fetchData();
      })
      .catch(err => {
        setIssues(oldIssues);
        showAlert("Lỗi", err.response?.data?.error || err.message, "error");
      });
  };

  const getStatusStyles = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return { bgcolor: '#fef08a', color: '#ca8a04' }; 
      case 'processing': return { bgcolor: '#bae6fd', color: '#0284c7' }; 
      case 'completed': return { bgcolor: '#bbf7d0', color: '#16a34a' }; 
      default: return { bgcolor: '#f1f5f9', color: '#64748b' };
    }
  };

  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [page, setPage] = useState(0);
  // SỬA LỖI: Comment hàm set
  const [rowsPerPage /*, setRowsPerPage */] = useState(5);

  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formData, setFormData] = useState({ 
    devices_id: '', room_id: '', devices_name: '', status: 'good', purchase_date: '' 
  });

  const fetchData = () => {
    axios.get('http://127.0.0.1:5000/api/rooms').then(res => setRooms(res.data));
    axios.get('http://127.0.0.1:5000/api/rooms/devices').then(response => { setDevices(response.data); setLoading(false); });
  };

  useEffect(() => { fetchData(); fetchIssues(); }, []);

  const filteredDevices = devices.filter(d => {
    const matchText = d.devices_name.toLowerCase().includes(searchTerm.toLowerCase()) || d.room_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchText && matchStatus;
  });

  // =========================================================
  // CODE CŨ
  // =========================================================
  /*
  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
  */

  const handleOpenModal = (device = null) => {
    setImageFile(null);
    if (device) {
      setIsEditMode(true);
      setFormData({ devices_id: device.devices_id, room_id: device.room_id, devices_name: device.devices_name, status: device.status, purchase_date: device.purchase_date || '' });
      setImagePreview(device.image_url ? `http://127.0.0.1:5000${device.image_url}` : '');
    } else {
      setIsEditMode(false);
      setFormData({ devices_id: '', room_id: '', devices_name: '', status: 'good', purchase_date: '' });
      setImagePreview('');
    }
    setOpen(true);
  };

  const handleCloseModal = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSave = () => {
    if (!formData.room_id || !formData.devices_name) { showAlert("Thiếu thông tin", "Vui lòng chọn phòng và nhập tên thiết bị!", "warning"); return; }
    const dataToSend = new FormData();
    dataToSend.append('room_id', formData.room_id);
    dataToSend.append('devices_name', formData.devices_name);
    dataToSend.append('status', formData.status);
    if (formData.purchase_date) dataToSend.append('purchase_date', formData.purchase_date);
    if (imageFile) dataToSend.append('image', imageFile);

    const apiCall = isEditMode ? axios.put(`http://127.0.0.1:5000/api/rooms/devices/${formData.devices_id}`, dataToSend) : axios.post('http://127.0.0.1:5000/api/rooms/devices', dataToSend);
    apiCall.then(() => { fetchData(); handleCloseModal(); showToast('Thành công!', 'success'); });
  };

  const handleDelete = (id) => {
    showConfirm('Xóa thiết bị?', 'Mất dữ liệu vĩnh viễn!').then((result) => {
      if (result.isConfirmed) { axios.delete(`http://127.0.0.1:5000/api/rooms/devices/${id}`).then(() => { fetchData(); showToast('Đã xóa!', 'success'); }); }
    });
  };

  const getDeviceStatusChip = (status) => {
    if (status === 'broken') return <Chip label="Bị hỏng" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }} />;
    if (status === 'maintenance') return <Chip label="Đang sửa" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 'bold' }} />;
    return <Chip label="Hoạt động tốt" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 'bold' }} />;
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#1e3a8a', mb: 0.5 }}>Device Maintenance</Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>Tiếp nhận báo cáo sự cố và quản lý tài sản KTX</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
            <Tab label="Yêu cầu bảo trì" sx={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'none' }} />
            <Tab label="Danh sách thiết bị" sx={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'none' }} />
          </Tabs>
        </Box>
      </Box>

      {tabIndex === 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Ngày báo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Phòng</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Sinh viên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Thiết bị</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#64748b', width: '30%' }}>Mô tả lỗi</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#64748b', textAlign: 'center' }}>Cập nhật trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issuesLoading ? ( <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow> ) : 
              issues.length > 0 ? issues.map((row) => (
                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: '0.2s' }}>
                  <TableCell sx={{ color: '#475569', fontSize: '14px' }}>{row.date}</TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight="bold" color="#2563eb">{row.room_name}</Typography></TableCell>
                  <TableCell sx={{ fontWeight: '500', color: '#1e293b' }}>{row.student_name}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#ea580c' }}>{row.device_name}</TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '14px' }}>{row.description}</TableCell>
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <Select value={row.status || 'pending'} onChange={(e) => handleStatusChange(row.id, e.target.value)} sx={{ borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', bgcolor: getStatusStyles(row.status).bgcolor, color: getStatusStyles(row.status).color, '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiSelect-icon': { color: getStatusStyles(row.status).color } }}>
                        <MenuItem value="pending" sx={{ fontWeight: 'bold', color: '#ca8a04' }}>Chưa sửa chữa</MenuItem>
                        <MenuItem value="processing" sx={{ fontWeight: 'bold', color: '#0284c7' }}>Đang tiến hành sửa</MenuItem>
                        <MenuItem value="completed" sx={{ fontWeight: 'bold', color: '#16a34a' }}>Đã sửa xong</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              )) : ( <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8 }}> <Typography color="#94a3b8" fontWeight="bold">Hiện không có yêu cầu bảo trì nào.</Typography> </TableCell></TableRow> )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabIndex === 1 && (
        <Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" alignItems="center" sx={{ mb: 3 }} spacing={2}>
            <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <TextField placeholder="Tìm tên thiết bị, phòng..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ bgcolor: 'white', borderRadius: '12px', '& .MuiOutlinedInput-root': { borderRadius: '12px' }, width: { xs: '100%', sm: '220px' }}} InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon sx={{ color: '#94a3b8' }} /> </InputAdornment> ), }} />
              <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ bgcolor: 'white', borderRadius: '12px', '& .MuiOutlinedInput-root': { borderRadius: '12px' }, minWidth: '150px' }}>
                <MenuItem value="all">Tất cả trạng thái</MenuItem>
                <MenuItem value="good">Hoạt động tốt</MenuItem>
                <MenuItem value="broken">Bị hỏng</MenuItem>
                <MenuItem value="maintenance">Đang sửa chữa</MenuItem>
              </TextField>
              <Button onClick={() => handleOpenModal()} variant="contained" startIcon={<BuildIcon />} sx={{ backgroundColor: '#1c3d8c', borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 3, whiteSpace: 'nowrap' }}> Thêm thiết bị </Button>
            </Stack>
          </Stack>

          <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Thiết bị</TableCell>
                  <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Vị trí (Phòng)</TableCell>
                  <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Ngày mua</TableCell>
                  <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Tình trạng</TableCell>
                  <TableCell align="center" sx={{ fontWeight: '700', color: '#475569' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? ( <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>Đang tải...</TableCell></TableRow> ) : (
                  filteredDevices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <TableRow key={row.devices_id} sx={{ '&:hover': { backgroundColor: '#f1f5f9' }, transition: '0.2s' }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar src={row.image_url ? `http://127.0.0.1:5000${row.image_url}` : undefined} sx={{ bgcolor: '#1c3d8c', color: 'white', fontWeight: 'bold', width: 45, height: 45, borderRadius: '10px' }}> {!row.image_url && <BuildIcon fontSize="small"/>} </Avatar>
                          <Typography variant="subtitle2" fontWeight="700" color="#1e293b">{row.devices_name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: '600', color: '#334155' }}>{row.room_name}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{row.purchase_date || "Chưa cập nhật"}</TableCell>
                      <TableCell>{getDeviceStatusChip(row.status)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" justifyContent="center" spacing={1}>
                          <Tooltip title="Chỉnh sửa" arrow><IconButton onClick={() => handleOpenModal(row)} sx={{ color: '#2563eb' }}><CiEdit size={24} /></IconButton></Tooltip>
                          <Tooltip title="Xóa thiết bị" arrow><IconButton onClick={() => handleDelete(row.devices_id)} sx={{ color: '#ef4444' }}><CiTrash size={24} /></IconButton></Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* PHÂN TRANG MỚI CHO TAB THIẾT BỊ */}
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, borderTop: '1px solid #f0f0f0' }}>
              <Pagination 
                count={Math.ceil(filteredDevices.length / rowsPerPage) || 1} 
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
                      '&.MuiPaginationItem-previousNext': { color: '#94a3b8', bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent', color: '#1e3a8a' } }
                    }}
                  />
                )}
              />
            </Box>
          </TableContainer>
        </Box>
      )}

      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: '800', pt: 3, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 1 }}> <BuildIcon /> {isEditMode ? 'Cập nhật' : 'Thêm mới'} </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box sx={{ textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: '16px', p: 3, position: 'relative', bgcolor: '#f8fafc' }}>
              {imagePreview ? ( <Box> <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '12px', marginBottom: '10px' }} /> <Button component="label" variant="outlined" size="small" sx={{ borderRadius: '8px', textTransform: 'none' }}> Đổi ảnh khác <input type="file" hidden accept="image/*" onChange={handleImageChange} /> </Button> </Box> ) : ( <Box> <CloudUploadIcon sx={{ fontSize: 50, color: '#94a3b8', mb: 1 }} /> <Typography variant="body2" color="#64748b" mb={2}>Nhấn để chọn ảnh thiết bị</Typography> <Button component="label" variant="contained" sx={{ bgcolor: '#1c3d8c', borderRadius: '8px', textTransform: 'none' }}> Tải ảnh <input type="file" hidden accept="image/*" onChange={handleImageChange} /> </Button> </Box> )}
            </Box>
            <TextField select label="Đặt tại Phòng" name="room_id" value={formData.room_id} onChange={handleChange} fullWidth>
              {rooms.map((room) => ( <MenuItem key={room.room_id} value={room.room_id}> {room.room_name} (Trống: {room.capacity - room.current_occupancy}) </MenuItem> ))}
            </TextField>
            <TextField label="Tên thiết bị" name="devices_name" value={formData.devices_name} onChange={handleChange} fullWidth variant="outlined" />
            <Stack direction="row" spacing={2}>
              <TextField select label="Tình trạng" name="status" value={formData.status} onChange={handleChange} fullWidth>
                <MenuItem value="good">Hoạt động tốt</MenuItem>
                <MenuItem value="broken">Bị hỏng</MenuItem>
                <MenuItem value="maintenance">Đang sửa</MenuItem>
              </TextField>
              <TextField label="Ngày mua" name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#64748b', fontWeight: 'bold' }}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#1c3d8c', fontWeight: 'bold', px: 4, borderRadius: '10px' }}> Lưu </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}