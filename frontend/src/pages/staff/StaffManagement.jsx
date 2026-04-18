import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Stack, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Tooltip, Pagination, PaginationItem 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import { CiEdit, CiTrash } from "react-icons/ci";
import axios from 'axios';
import { showToast, showAlert, showConfirm } from '../../utils/swal';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const [openStaffModal, setOpenStaffModal] = useState(false);
  const [isEditStaff, setIsEditStaff] = useState(false);
  
  const [staffForm, setStaffForm] = useState({ 
    user_id: '', username: '', email: '', password: '', role: 'staff', full_name: '', phone: '' 
  });

  const API_URL = 'http://127.0.0.1:5000/api/admin/staff';

  // FIX LỖI VÀNG REACT: Dùng useCallback để bọc cấu hình và hàm fetch
  const getConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }, []);

  const fetchStaff = useCallback(() => {
    axios.get(API_URL, getConfig())
      .then(res => { setStaffList(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [getConfig]);

  // useEffect giờ đây đã có đủ dependency, sẽ không còn bị gạch dưới màu vàng nữa
  useEffect(() => { 
    fetchStaff(); 
  }, [fetchStaff]);

  const handleOpenStaffModal = (staff = null) => {
    if (staff) {
      setIsEditStaff(true);
      setStaffForm({ 
        user_id: staff.user_id, username: staff.username, email: staff.email, 
        password: '', role: staff.role, full_name: staff.full_name || '', phone: staff.phone || '' 
      });
    } else {
      setIsEditStaff(false);
      setStaffForm({ user_id: '', username: '', email: '', password: '', role: 'staff', full_name: '', phone: '' });
    }
    setOpenStaffModal(true);
  };

  const handleStaffChange = (e) => setStaffForm({ ...staffForm, [e.target.name]: e.target.value });

  const handleSaveStaff = () => {
    const apiCall = isEditStaff 
      ? axios.put(`${API_URL}/${staffForm.user_id}`, staffForm, getConfig())
      : axios.post(API_URL, staffForm, getConfig()); 

    apiCall.then(() => { 
        fetchStaff(); 
        setOpenStaffModal(false); 
        showToast(isEditStaff ? 'Cập nhật nhân viên thành công!' : 'Tạo tài khoản nhân viên thành công!', 'success');
      })
      .catch(err => showAlert("Lỗi!", err.response?.data?.error || "Lỗi kết nối", "error"));
  };

  const handleDeleteStaff = (id) => {
    showConfirm('Xóa nhân viên?', 'Bạn có chắc muốn xóa tài khoản nhân sự này không?')
      .then((result) => {
        if (result.isConfirmed) {
          axios.delete(`${API_URL}/${id}`, getConfig())
            .then(() => { fetchStaff(); showToast('Đã xóa thành công!', 'success'); })
            .catch(err => showAlert("Lỗi!", err.response?.data?.error || "Không thể xóa", "error"));
        }
      });
  };

  const getRoleChip = (role) => {
    switch(role) {
      case 'admin': return <Chip label="Quản trị viên" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }} />;
      case 'staff': return <Chip label="Nhân viên" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' }} />;
      default: return <Chip label={role} size="small" />;
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 4 }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1e3a8a', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon fontSize="large" /> Staff Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>Quản lý danh sách nhân sự và phân quyền hệ thống</Typography>
        </Box>
        
        <Button onClick={() => handleOpenStaffModal()} variant="contained" startIcon={<PersonAddIcon />} sx={{ backgroundColor: '#1e3a8a', borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 3 }}>
          Thêm Nhân Sự
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Nhân viên</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Vai trò (Role)</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Số điện thoại</TableCell>
              <TableCell align="center" sx={{ fontWeight: '700', color: '#475569' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? ( <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>Đang tải dữ liệu...</TableCell></TableRow> ) : 
              staffList.length > 0 ? staffList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((staff) => (
              <TableRow key={staff.user_id} sx={{ '&:hover': { backgroundColor: '#f1f5f9' }, transition: '0.2s' }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">{staff.username}</Typography>
                  <Typography variant="caption" color="#64748b">{staff.full_name || 'Chưa cập nhật tên'}</Typography>
                </TableCell>
                <TableCell>{getRoleChip(staff.role)}</TableCell>
                <TableCell sx={{ color: '#64748b' }}>{staff.email}</TableCell>
                <TableCell sx={{ color: '#64748b' }}>{staff.phone || 'N/A'}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" justifyContent="center" spacing={1}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton onClick={() => handleOpenStaffModal(staff)} sx={{ color: '#2563eb' }}><CiEdit size={22} /></IconButton>
                    </Tooltip>
                    {staff.role !== 'admin' && (
                      <Tooltip title="Xóa tài khoản">
                        <IconButton onClick={() => handleDeleteStaff(staff.user_id)} sx={{ color: '#ef4444' }}><CiTrash size={22} /></IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell col colSpan={5} align="center" sx={{ py: 6, color: '#94a3b8' }}>Chưa có nhân viên nào trong hệ thống.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, borderTop: '1px solid #f0f0f0' }}>
          <Pagination count={Math.ceil(staffList.length / rowsPerPage) || 1} page={page + 1} onChange={(e, value) => setPage(value - 1)} renderItem={(item) => ( <PaginationItem {...item} components={{ previous: () => <span style={{ fontWeight: 'bold' }}>&lt; Prev</span>, next: () => <span style={{ fontWeight: 'bold' }}>Next &gt;</span> }} sx={{ fontWeight: '600', color: '#64748b', fontSize: '14px', borderRadius: '12px', margin: '0 4px', '&.Mui-selected': { bgcolor: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', '&:hover': { bgcolor: '#f1f5f9' } }, '&.MuiPaginationItem-previousNext': { color: '#94a3b8', bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent', color: '#1e3a8a' } } }} /> )} />
        </Box>
      </TableContainer>

      <Dialog open={openStaffModal} onClose={() => setOpenStaffModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: '800', pt: 3, color: '#1e3a8a' }}>
          {isEditStaff ? 'Cập nhật Thông tin' : 'Tạo Tài khoản Nhân sự'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Chọn Vai trò (Role)" name="role" value={staffForm.role} onChange={handleStaffChange} fullWidth size="small">
              <MenuItem value="staff">Nhân viên (Staff)</MenuItem>
              <MenuItem value="admin">Quản trị viên (Toàn quyền)</MenuItem>
            </TextField>
            <TextField label="Tên đăng nhập" name="username" value={staffForm.username} onChange={handleStaffChange} fullWidth disabled={isEditStaff} size="small" />
            <TextField label="Họ và tên" name="full_name" value={staffForm.full_name} onChange={handleStaffChange} fullWidth size="small" />
            <TextField label="Số điện thoại" name="phone" value={staffForm.phone} onChange={handleStaffChange} fullWidth size="small" />
            <TextField label="Email" name="email" value={staffForm.email} onChange={handleStaffChange} fullWidth size="small" />
            {!isEditStaff && ( <TextField label="Mật khẩu" name="password" type="password" value={staffForm.password} onChange={handleStaffChange} fullWidth size="small" /> )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenStaffModal(false)} sx={{ color: '#64748b', fontWeight: 'bold' }}>Hủy</Button>
          <Button onClick={handleSaveStaff} variant="contained" sx={{ bgcolor: '#2563eb', fontWeight: 'bold' }}>
            {isEditStaff ? 'Lưu thay đổi' : 'Tạo Tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}