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
        showToast(isEditStaff ? 'Staff updated successfully!' : 'Staff account created successfully!', 'success');
      })
      .catch(err => showAlert("Error!", err.response?.data?.error || "Connection error", "error"));
  };

  const handleDeleteStaff = (id) => {
    showConfirm('Delete staff member?', 'Are you sure you want to delete this staff account?')
      .then((result) => {
        if (result.isConfirmed) {
          axios.delete(`${API_URL}/${id}`, getConfig())
            .then(() => { fetchStaff(); showToast('Deleted successfully!', 'success'); })
            .catch(err => showAlert("Error!", err.response?.data?.error || "Cannot delete", "error"));
        }
      });
  };

  const getRoleChip = (role) => {
    switch(role) {
      case 'admin': return <Chip label="Administrator" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }} />;
      case 'staff': return <Chip label="Staff" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 'bold' }} />;
      default: return <Chip label={role} size="small" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 0, sm: 1 }, maxWidth: '100%', overflowX: 'hidden' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 4 }} spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1e3a8a', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '2rem', sm: '2.125rem' } }}>
            <GroupIcon fontSize="large" /> Staff Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>Manage staff list and system permissions</Typography>
        </Box>
        
        <Button onClick={() => handleOpenStaffModal()} variant="contained" startIcon={<PersonAddIcon />} sx={{ backgroundColor: '#1e3a8a', borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 3, width: { xs: '100%', sm: 'auto' } }}>
          Add Staff
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0', overflowX: 'auto', maxWidth: '100%' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Staff Member</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: '700', color: '#475569' }}>Phone Number</TableCell>
              <TableCell align="center" sx={{ fontWeight: '700', color: '#475569' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? ( <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>Loading data...</TableCell></TableRow> ) : 
              staffList.length > 0 ? staffList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((staff) => (
              <TableRow key={staff.user_id} sx={{ '&:hover': { backgroundColor: '#f1f5f9' }, transition: '0.2s' }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">{staff.username}</Typography>
                  <Typography variant="caption" color="#64748b">{staff.full_name || 'Name not updated'}</Typography>
                </TableCell>
                <TableCell>{getRoleChip(staff.role)}</TableCell>
                <TableCell sx={{ color: '#64748b' }}>{staff.email}</TableCell>
                <TableCell sx={{ color: '#64748b' }}>{staff.phone || 'N/A'}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" justifyContent="center" spacing={1}>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenStaffModal(staff)} sx={{ color: '#2563eb' }}><CiEdit size={22} /></IconButton>
                    </Tooltip>
                    {staff.role !== 'admin' && (
                      <Tooltip title="Delete Account">
                        <IconButton onClick={() => handleDeleteStaff(staff.user_id)} sx={{ color: '#ef4444' }}><CiTrash size={22} /></IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94a3b8' }}>No staff members in the system.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, borderTop: '1px solid #f0f0f0' }}>
          <Pagination count={Math.ceil(staffList.length / rowsPerPage) || 1} page={page + 1} onChange={(e, value) => setPage(value - 1)} renderItem={(item) => ( <PaginationItem {...item} components={{ previous: () => <span style={{ fontWeight: 'bold' }}>&lt; Prev</span>, next: () => <span style={{ fontWeight: 'bold' }}>Next &gt;</span> }} sx={{ fontWeight: '600', color: '#64748b', fontSize: '14px', borderRadius: '12px', margin: '0 4px', '&.Mui-selected': { bgcolor: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', '&:hover': { bgcolor: '#f1f5f9' } }, '&.MuiPaginationItem-previousNext': { color: '#94a3b8', bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent', color: '#1e3a8a' } } }} /> )} />
        </Box>
      </TableContainer>

      <Dialog open={openStaffModal} onClose={() => setOpenStaffModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: '800', pt: 3, color: '#1e3a8a' }}>
          {isEditStaff ? 'Update Information' : 'Create Staff Account'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Select Role" name="role" value={staffForm.role} onChange={handleStaffChange} fullWidth size="small">
              <MenuItem value="staff">Staff</MenuItem>
              <MenuItem value="admin">Administrator (Full Access)</MenuItem>
            </TextField>
            <TextField label="Username" name="username" value={staffForm.username} onChange={handleStaffChange} fullWidth disabled={isEditStaff} size="small" />
            <TextField label="Full Name" name="full_name" value={staffForm.full_name} onChange={handleStaffChange} fullWidth size="small" />
            <TextField label="Phone Number" name="phone" value={staffForm.phone} onChange={handleStaffChange} fullWidth size="small" />
            <TextField label="Email" name="email" value={staffForm.email} onChange={handleStaffChange} fullWidth size="small" />
            {!isEditStaff && ( <TextField label="Password" name="password" type="password" value={staffForm.password} onChange={handleStaffChange} fullWidth size="small" /> )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenStaffModal(false)} sx={{ color: '#64748b', fontWeight: 'bold' }}>Cancel</Button>
          <Button onClick={handleSaveStaff} variant="contained" sx={{ bgcolor: '#2563eb', fontWeight: 'bold' }}>
            {isEditStaff ? 'Save Changes' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
