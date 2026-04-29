import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Avatar, Stack, Button,
  TextField, InputAdornment, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Pagination, PaginationItem 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import axios from 'axios';
import { showToast, showConfirm, showAlert } from '../../utils/swal';

export default function PaymentManagement() {
  const [tabIndex, setTabIndex] = useState(0); 
  const [bills, setBills] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(''); 
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);
  const [activeContracts, setActiveContracts] = useState([]);
  const [billForm, setBillForm] = useState({
    contract_id: '', title: '', amount: '', due_date: ''
  });

  const getConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchData = useCallback(() => {
    const billsApi = axios.get('http://127.0.0.1:5000/api/payments/bills', getConfig());
    const historyApi = axios.get('http://127.0.0.1:5000/api/payments/history', getConfig());

    Promise.all([billsApi, historyApi])
      .then(([billsRes, historyRes]) => {
        setBills(billsRes.data);
        setHistory(historyRes.data);
      })
      .catch(err => console.error("Error loading payment data:", err))
      .finally(() => setLoading(false));
  }, [getConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleTabChange = (e, newValue) => { setTabIndex(newValue); setPage(0); setSearchTerm(''); };
  
  const handlePayBill = (bill) => {
    showConfirm(
      'Confirm Payment?', 
      `Did student ${bill.student_name} pay ${formatCurrency(bill.amount)}?`
    ).then((result) => {
      if (result.isConfirmed) {
        axios.post(`http://127.0.0.1:5000/api/payments/bills/${bill.bill_id}/pay`, { method: 'Cash' }, getConfig())
          .then(() => {
            fetchData();
            showToast('Payment recorded successfully!', 'success');
          })
          .catch(err => showAlert("Error!", err.response?.data?.error, "error"));
      }
    });
  };

  const handleOpenModal = () => {
    axios.get('http://127.0.0.1:5000/api/contracts', getConfig())
      .then(res => {
        const active = res.data.filter(c => c.status === 'active' || c.status === 'Approved');
        setActiveContracts(active);
        
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5); 
        const currentMonthStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        
        setBillForm({
          contract_id: '', title: `Dormitory Fee Month ${currentMonthStr}`, amount: '', due_date: nextMonth.toISOString().split('T')[0]
        });
        setOpenModal(true);
      })
      .catch(err => {
        console.error("Error loading contract list:", err);
        showAlert("Error", "Cannot load contract list", "error");
      });
  };

  const handleContractChange = (e) => {
    const selectedId = e.target.value;
    const contract = activeContracts.find(c => c.contract_id === selectedId || c.id === selectedId);
    const price = contract?.room?.price || contract?.price || 1500000; 
    setBillForm({ ...billForm, contract_id: selectedId, amount: price });
  };

  const handleSubmitSingleBill = () => {
    if (!billForm.contract_id || !billForm.amount) {
      showToast('Please fill in all fields!', 'warning');
      return;
    }
    axios.post('http://127.0.0.1:5000/api/payments/create', billForm, getConfig())
      .then(() => {
        showToast('Bill created successfully!', 'success');
        setOpenModal(false);
        fetchData();
      })
      .catch(() => showAlert("Error!", "Cannot create bill, possibly a duplicate", "error"));
  };

  const handleBulkCreate = () => {
    showConfirm(
      'Bulk Issue Bills?', 
      'The system will scan all Active contracts and generate bills. If a student already has a bill for this month, it will be skipped to prevent duplicates.'
    ).then(result => {
        if(result.isConfirmed) {
          axios.post('http://127.0.0.1:5000/api/payments/auto-generate', {}, getConfig())
            .then((res) => {
              showToast(res.data.message, 'success');
              fetchData();
            })
            .catch(err => {
              console.error(err);
              showAlert("Error!", err.response?.data?.error || "An error occurred during bulk issue", "error");
            });
        }
      });
  };

  const currentList = tabIndex === 0 ? bills : history;
  const filteredList = currentList.filter(item => 
    item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.room_name && item.room_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box sx={{ p: { xs: 0, sm: 1 }, maxWidth: '100%', overflowX: 'hidden' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 3 }} spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight="900" color="#1e3a8a" gutterBottom sx={{ fontSize: { xs: '2rem', sm: '2.125rem' } }}>Payments & Bills</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>Manage bills and track monthly revenue</Typography>
        </Box>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch" sx={{ width: { xs: '100%', md: 'auto' } }}>
          <TextField 
              placeholder="Search student, room..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b' }}/></InputAdornment> }}
              sx={{ width: { xs: '100%', sm: '250px' }, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '12px', '& fieldset': { borderColor: '#cbd5e1', borderWidth: '1.5px' }, '&:hover fieldset': { borderColor: '#1c3d8c' }, '&.Mui-focused fieldset': { borderColor: '#1c3d8c', borderWidth: '2px' }, } }}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal} sx={{ bgcolor: '#1c3d8c', borderRadius: '10px', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#152d69' } }}> Create Bill </Button>
          <Button variant="contained" startIcon={<BoltIcon />} onClick={handleBulkCreate} sx={{ bgcolor: '#ea580c', borderRadius: '10px', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#c2410c' } }}> Bulk Issue </Button>
        </Stack>
      </Stack>

      <Paper sx={{ mb: 3, borderRadius: '16px', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" allowScrollButtonsMobile sx={{ px: 2, '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none' }}}>
          <Tab icon={<ReceiptIcon sx={{ mr: 1 }}/>} iconPosition="start" label={`Pending Bills (${bills.filter(b => b.status === 'unpaid').length})`} />
          <Tab icon={<HistoryIcon sx={{ mr: 1 }}/>} iconPosition="start" label="Revenue History" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: '20px', border: '1px solid #f0f0f0', overflowX: 'auto', maxWidth: '100%' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
              {tabIndex === 0 && <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>}
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{tabIndex === 0 ? 'Due Date' : 'Payment Date'}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              {tabIndex === 0 ? (
                <>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </>
              ) : (
                <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}>Loading data...</TableCell></TableRow> : 
              filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
                <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: '0.2s' }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#1c3d8c', width: 36, height: 36 }}>{row.student_name.charAt(0)}</Avatar>
                      <Typography variant="body2" fontWeight="600">{row.student_name}</Typography>
                    </Stack>
                  </TableCell>
                  {tabIndex === 0 && <TableCell>{row.room_name}</TableCell>}
                  <TableCell sx={{ fontWeight: '500', color: '#334155' }}>{row.title}</TableCell>
                  <TableCell sx={{ color: '#64748b' }}> {tabIndex === 0 ? row.due_date : row.payment_date} </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#059669' }}> {formatCurrency(tabIndex === 0 ? row.amount : row.amount_paid)} </TableCell>
                  {tabIndex === 0 ? (
                    <>
                      <TableCell>
                        <Chip label={row.status === 'unpaid' ? 'Unpaid' : 'Paid'} size="small" color={row.status === 'unpaid' ? 'error' : 'success'} sx={{ fontWeight: 'bold' }}/>
                      </TableCell>
                      <TableCell align="center">
                        {row.status === 'unpaid' ? (
                          <Button variant="contained" size="small" startIcon={<CheckCircleIcon />} onClick={() => handlePayBill(row)} sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, borderRadius: '8px' }}> Collect </Button>
                        ) : (
                          <Typography variant="caption" color="success.main" fontWeight="bold">Completed</Typography>
                        )}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell> <Chip label={row.method} size="small" variant="outlined" color="primary" /> </TableCell>
                  )}
                </TableRow>
              ))
            }
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, borderTop: '1px solid #f0f0f0' }}>
          <Pagination count={Math.ceil(filteredList.length / rowsPerPage) || 1} page={page + 1} onChange={(e, value) => setPage(value - 1)} renderItem={(item) => ( <PaginationItem {...item} components={{ previous: () => <span style={{ fontWeight: 'bold' }}>&lt; Prev</span>, next: () => <span style={{ fontWeight: 'bold' }}>Next &gt;</span> }} sx={{ fontWeight: '600', color: '#64748b', fontSize: '14px', borderRadius: '12px', margin: '0 4px', '&.Mui-selected': { bgcolor: '#f8fafc', color: '#1e293b', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', '&:hover': { bgcolor: '#f1f5f9' } }, '&.Mui-disabled': { opacity: 0.3 }, '&.MuiPaginationItem-previousNext': { color: '#94a3b8', bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent', color: '#1e3a8a' } } }} /> )} />
        </Box>
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>Create New Bill</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Student (Active Contract)</InputLabel>
              <Select value={billForm.contract_id} label="Select Student (Active Contract)" onChange={handleContractChange}>
                {activeContracts.map(c => (
                  <MenuItem key={c.contract_id || c.id} value={c.contract_id || c.id}> {c.user?.full_name || c.student_name || 'Student'} - Room {c.room?.room_name || c.room_name || 'N/A'} </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Description" size="small" fullWidth value={billForm.title} onChange={(e) => setBillForm({ ...billForm, title: e.target.value })} />
            <TextField label="Amount (VND)" type="number" size="small" fullWidth value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} />
            <TextField label="Due Date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={billForm.due_date} onChange={(e) => setBillForm({ ...billForm, due_date: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSubmitSingleBill} variant="contained" sx={{ bgcolor: '#1c3d8c' }}> Create Bill </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
