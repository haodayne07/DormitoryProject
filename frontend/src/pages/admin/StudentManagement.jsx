import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Avatar, Stack, Button,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Tooltip, InputAdornment, 
  Pagination, PaginationItem 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import { CiEdit, CiTrash } from "react-icons/ci";
import axios from 'axios';
import { showToast, showConfirm, showAlert } from '../../utils/swal';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Đã thêm các trường thông tin mới
  const [formData, setFormData] = useState({ 
    user_id: '', username: '', email: '', password: '', 
    full_name: '', phone: '', student_code: '' 
  });

  const API_URL = 'http://127.0.0.1:5000/api/students';

  // HÀM GẮN TOKEN BẢO MẬT
  const getConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchStudents = useCallback(() => {
    axios.get(API_URL, getConfig())
      .then(response => { setStudents(response.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [getConfig]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Bộ lọc tìm kiếm thông minh hơn
  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.username?.toLowerCase().includes(term) || 
      s.email?.toLowerCase().includes(term) ||
      s.full_name?.toLowerCase().includes(term) ||
      s.student_code?.toLowerCase().includes(term)
    );
  });

  const handleOpenModal = (student = null) => {
    if (student) {
      setIsEditMode(true);
      setFormData({ 
        user_id: student.user_id, username: student.username, email: student.email, password: '',
        full_name: student.full_name || '', phone: student.phone || '', student_code: student.student_code || ''
      });
    } else {
      setIsEditMode(false);
      setFormData({ user_id: '', username: '', email: '', password: '', full_name: '', phone: '', student_code: '' });
    }
    setOpen(true);
  };

  const handleCloseModal = () => setOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    const apiCall = isEditMode 
      ? axios.put(`${API_URL}/${formData.user_id}`, formData, getConfig())
      : axios.post(API_URL, formData, getConfig());

    apiCall.then(() => { 
        fetchStudents(); 
        handleCloseModal(); 
        showToast(isEditMode ? 'Cập nhật thành công!' : 'Tạo mới thành công!', 'success');
      })
      .catch(err => {
        showAlert("Lỗi!", err.response?.data?.error || "Lỗi kết nối", "error");
      });
  };

  const handleDelete = (id) => {
    showConfirm('Bạn có chắc chắn?', 'Dữ liệu sinh viên này sẽ bị xóa vĩnh viễn!')
      .then((result) => {
        if (result.isConfirmed) {
          axios.delete(`${API_URL}/${id}`, getConfig())
            .then(() => { fetchStudents(); showToast('Đã xóa thành công!', 'success'); })
            .catch(err => { showAlert("Không thể xóa!", err.response?.data?.error, "error"); });
        }
      });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <Box sx={{ p: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 4 }} spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1e3a8a', mb: 0.5 }}>Students List</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>Quản lý hồ sơ lưu trú của sinh viên</Typography>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <TextField 
            placeholder="Tìm theo tên, email, MSSV..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ bgcolor: 'white', borderRadius: '12px', '& .MuiOutlinedInput-root': { borderRadius: '12px' }, width: { xs: '100%', sm: '250px' } }}
            InputProps={{ startAdornment: ( <InputAdornment position="start"> <SearchIcon sx={{ color: '#94a3b8' }} /> </InputAdornment> ) }}
          />
          <Button onClick={() => handleOpenModal()} variant="contained" startIcon={<PersonAddIcon />} sx={{ backgroundColor: '#1e3a8a', borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 3 }}>
            Thêm mới
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Hồ sơ Sinh viên</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Liên hệ</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Phòng</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Số dư ví</TableCell>
              <TableCell align="center" sx={{ fontWeight: '700', color: '#475569' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? ( <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>Đang tải dữ liệu...</TableCell></TableRow> ) : (
              filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.user_id} sx={{ '&:hover': { backgroundColor: '#f1f5f9' }, transition: '0.2s' }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: '#dbeafe', color: '#2563eb', fontWeight: 'bold', width: 40, height: 40 }}>
                        {row.username ? row.username.charAt(0).toUpperCase() : 'S'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="700" color="#1e293b">{row.full_name || row.username}</Typography>
                        <Typography variant="caption" color="#64748b" sx={{ display: 'block' }}>MSSV: {row.student_code || 'Chưa cập nhật'}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="#475569">{row.email}</Typography>
                    <Typography variant="caption" color="#64748b">{row.phone || 'SĐT: N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.room || 'Chưa xếp'} size="small" sx={{ fontWeight: '600', bgcolor: row.room !== 'Chưa xếp' ? '#f0fdf4' : '#fff7ed', color: row.room !== 'Chưa xếp' ? '#166534' : '#9a3412' }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(row.balance || 0)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={1}>
                      <Tooltip title="Chỉnh sửa"><IconButton onClick={() => handleOpenModal(row)} sx={{ color: '#2563eb' }}><CiEdit size={22} /></IconButton></Tooltip>
                      <Tooltip title="Xóa"><IconButton onClick={() => handleDelete(row.user_id)} sx={{ color: '#ef4444' }}><CiTrash size={22} /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
            {filteredStudents.length === 0 && !loading && ( <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: '#94a3b8' }}>Không tìm thấy sinh viên nào khớp với từ khóa.</TableCell></TableRow> )}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, borderTop: '1px solid #f0f0f0' }}>
          <Pagination 
            count={Math.ceil(filteredStudents.length / rowsPerPage) || 1} 
            page={page + 1} onChange={(e, value) => setPage(value - 1)} 
            renderItem={(item) => (
              <PaginationItem {...item} components={{ previous: () => <span style={{ fontWeight: 'bold' }}>&lt; Prev</span>, next: () => <span style={{ fontWeight: 'bold' }}>Next &gt;</span> }} sx={{ fontWeight: '600', color: '#64748b', fontSize: '14px', borderRadius: '12px', margin: '0 4px', '&.Mui-selected': { bgcolor: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', '&:hover': { bgcolor: '#f1f5f9' } }, '&.MuiPaginationItem-previousNext': { color: '#94a3b8', bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent', color: '#1e3a8a' } } }} />
            )}
          />
        </Box>
      </TableContainer>

      <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: '800', pt: 3, color: '#1e3a8a' }}>{isEditMode ? 'Cập nhật Hồ sơ' : 'Tạo Hồ sơ Sinh viên'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Tên đăng nhập" name="username" value={formData.username} onChange={handleChange} fullWidth disabled={isEditMode} size="small" />
              {!isEditMode && <TextField label="Mật khẩu" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth size="small" />}
            </Box>
            <TextField label="Họ và tên đầy đủ" name="full_name" value={formData.full_name} onChange={handleChange} fullWidth size="small" />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Mã sinh viên (MSSV)" name="student_code" value={formData.student_code} onChange={handleChange} fullWidth size="small" />
              <TextField label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} fullWidth size="small" />
            </Box>
            <TextField label="Email liên hệ" name="email" value={formData.email} onChange={handleChange} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#64748b', fontWeight: 'bold' }}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#2563eb', fontWeight: 'bold', px: 3 }}>Lưu Hồ Sơ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}