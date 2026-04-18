import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Card, CardContent, Stack, Button, Chip, Avatar, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Paper,
  Snackbar 
} from '@mui/material';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; 
import axios from 'axios';
// THÊM MỚI: Import useLocation và useNavigate để bắt URL từ MoMo trả về
import { useLocation, useNavigate } from 'react-router-dom'; 

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [openLegalDialog, setOpenLegalDialog] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // THÊM MỚI: State để xử lý hiệu ứng loading khi đang chuyển hướng sang MoMo
  const [paying, setPaying] = useState(false);

  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  const currentStudentId = localStorage.getItem('user_id'); 

  // THÊM MỚI: Khởi tạo location và navigate
  const location = useLocation();
  const navigate = useNavigate();

  const fetchData = () => {
    axios.get(`http://127.0.0.1:5000/api/students/dashboard/${currentStudentId}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải dữ liệu Student Dashboard:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // THÊM MỚI: XỬ LÝ KẾT QUẢ MOMO TRẢ VỀ TRÊN URL
  // ==========================================
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resultCode = queryParams.get('resultCode');
    const orderId = queryParams.get('orderId');

    if (resultCode && orderId) {
      if (resultCode === '0') {
        // Giao dịch thành công, gọi API cập nhật trạng thái
        axios.get(`http://127.0.0.1:5000/api/payments/momo_return?resultCode=${resultCode}&orderId=${orderId}`)
          .then(() => {
            setToast({ open: true, message: 'Thanh toán MoMo thành công!', type: 'success' });
            fetchData(); // Tải lại dữ liệu để chuyển thẻ hóa đơn sang màu xanh
          })
          .catch(err => {
            console.error("Lỗi cập nhật thanh toán:", err);
            setToast({ open: true, message: 'Có lỗi khi cập nhật trạng thái hóa đơn.', type: 'error' });
          });
      } else {
        // Giao dịch thất bại hoặc bị hủy
        setToast({ open: true, message: 'Giao dịch bị hủy hoặc chưa hoàn tất.', type: 'error' });
      }
      
      // Xóa các tham số trên URL để làm sạch đường dẫn
      navigate('/student/dashboard', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, navigate]);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleRequestRoom = () => {
    setSubmitting(true);
    axios.post('http://127.0.0.1:5000/api/students/request-room', {
      user_id: currentStudentId,
      room_id: selectedRoom.id
    })
    .then(() => { 
      setToast({ open: true, message: 'Gửi yêu cầu thành công! Vui lòng chờ.', type: 'success' });
      setOpenLegalDialog(false);
      setSelectedRoom(null);
      setLoading(true); 
      fetchData(); 
    })
    .catch(err => {
      setToast({ open: true, message: "Có lỗi xảy ra: " + (err.response?.data?.error || err.message), type: 'error' });
    })
    .finally(() => setSubmitting(false));
  };

  // ==========================================
  // HÀM XỬ LÝ GỌI API THANH TOÁN MOMO
  // ==========================================
  const handlePayment = () => {
    setPaying(true);
    
    // Lấy ID hóa đơn thật từ database trả về
    const billId = data.billing.id || 1;

    axios.post('http://127.0.0.1:5000/api/payments/create_momo_payment', {
      bill_id: billId
    })
    .then(response => {
      if (response.data.payUrl) {
        window.location.href = response.data.payUrl;
      }
    })
    .catch(err => {
      setToast({ open: true, message: "Lỗi tạo thanh toán: " + (err.response?.data?.error || err.message), type: 'error' });
      setPaying(false);
    });
  };

  if (loading || !data) {
    return (
      <Box sx={{ width: '100%', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const containerStyle = { width: '100%', maxWidth: '100%', m: 0, pb: 5 };

  if (data.hasRejectedRequest) {
    return (
      <Box sx={{ ...containerStyle, minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '16px', textAlign: 'center', border: '1px solid #fca5a5', maxWidth: '600px', width: '100%', bgcolor: '#fef2f2' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#fee2e2', color: '#dc2626', margin: '0 auto', mb: 3 }}>
            <ErrorOutlineIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" color="#991b1b" sx={{ textTransform: 'uppercase', mb: 4, lineHeight: 1.6 }}>
            HỢP ĐỒNG CỦA BẠN ĐÃ BỊ TỪ CHỐI, HÃY LIÊN HỆ ADMIN@123 ĐỂ BIẾT THÊM CHI TIẾT
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            href="mailto:admin@gmail.com"
            sx={{ borderRadius: '8px', fontWeight: 'bold', px: 4, py: 1.5, boxShadow: 'none', '&:hover': {bgcolor: '#b91c1c'} }}
          >
            Liên hệ ngay với Admin
          </Button>
        </Paper>
      </Box>
    );
  }

  if (data.hasPendingRequest) {
    return (
      <Box sx={{ ...containerStyle, minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: '16px', textAlign: 'center', border: '1px solid #e0e0e0', maxWidth: '600px', width: '100%', bgcolor: 'white' }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#fef08a', color: '#ca8a04', margin: '0 auto', mb: 3 }}>
            <HourglassEmptyIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" color="#1e293b" mb={1}>Đang chờ duyệt hợp đồng</Typography>
          <Typography variant="body1" color="#64748b" mb={4}>
            Yêu cầu thuê phòng của bạn đã được gửi đến Ban quản lý. Vui lòng chờ Admin xác nhận. Quá trình này có thể mất từ 1-2 ngày làm việc.
          </Typography>
          <Button variant="outlined" disabled sx={{ borderRadius: '8px', fontWeight: 'bold', px: 4, py: 1.5 }}>Trạng thái: Pending</Button>
        </Paper>
      </Box>
    );
  }

  if (!data.hasRoom) {
    return (
      <Box sx={containerStyle}>
        <Box sx={{ mb: 5, pb: 3, borderBottom: '2px solid #f0f0f0' }}>
          <Typography variant="h4" fontWeight="900" color="#1e293b" mb={1}>Chào {data.studentName},</Typography>
          <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 'normal' }}>Dưới đây là danh sách các phòng đang trống. Hãy chọn một phòng để tiếp tục.</Typography>
        </Box>

        <Grid container spacing={4}>
          {data.availableRooms?.map(room => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
              <Card sx={{ 
                borderRadius: '12px', 
                border: '1px solid #ebebeb', 
                boxShadow: 'none', 
                transition: 'all 0.3s ease', 
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { 
                  borderColor: '#f97316', 
                  boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)' 
                } 
              }}
              onClick={() => setSelectedRoom(room)}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  {room.image_url ? (
                    <Box 
                      component="img"
                      src={room.image_url.startsWith('http') ? room.image_url : `http://127.0.0.1:5000/${room.image_url.replace(/^\/+/, '')}`}
                      alt={room.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/f1f5f9/94a3b8?text=No+Image"; }}
                      sx={{ width: '100%', height: '240px', objectFit: 'cover', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.05)' } }}
                    />
                  ) : (
                    <Box sx={{ width: '100%', height: '240px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="#94a3b8" variant="body2">Chưa có ảnh</Typography>
                    </Box>
                  )}
                  <Chip label="Tin ưu tiên" size="small" sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 'bold', fontSize: '12px', py: 1.5 }} />
                </Box>

                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:last-child': { pb: 3 } }}>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="#1e293b" sx={{ mb: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {room.name}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="#ea580c" mb={2}>
                      {formatCurrency(room.price)} / tháng
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} color="#64748b" sx={{ fontSize: '14px' }}>
                    <Typography variant="body2" fontWeight="500">Sức chứa: {room.capacity} người</Typography>
                    <Typography variant="body2">•</Typography>
                    <Typography variant="body2" fontWeight="500">Đang trống: {room.capacity - room.current_tenants}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {(!data.availableRooms || data.availableRooms.length === 0) && (
            <Grid item xs={12}>
              <Typography sx={{ p: 6, textAlign: 'center', color: '#64748b', bgcolor: '#f8fafc', borderRadius: '12px', fontSize: '1.2rem' }}>Hiện tại không có phòng nào đang trống.</Typography>
            </Grid>
          )}
        </Grid>

        <Dialog open={Boolean(selectedRoom)} onClose={() => setSelectedRoom(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #ebebeb', pb: 2, pt: 3, px: 4 }}>Chi tiết {selectedRoom?.name}</DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {selectedRoom?.image_url ? (
              <Box 
                component="img"
                src={selectedRoom.image_url.startsWith('http') ? selectedRoom.image_url : `http://127.0.0.1:5000/${selectedRoom.image_url.replace(/^\/+/, '')}`}
                alt={selectedRoom.name}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/f1f5f9/94a3b8?text=Loi+tai+anh"; }}
                sx={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', mb: 3 }}
              />
            ) : (
              <Box sx={{ width: '100%', height: '250px', bgcolor: '#f8fafc', borderRadius: '12px', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>
                <Typography color="#94a3b8" fontWeight="bold">Phòng này chưa cập nhật hình ảnh</Typography>
              </Box>
            )}

            <Typography variant="h5" fontWeight="bold" color="#ea580c" mb={1}>{formatCurrency(selectedRoom?.price)} <span style={{fontSize: '16px', color: '#64748b', fontWeight: 'normal'}}>/ sinh viên / tháng</span></Typography>
            <Typography variant="body1" color="#64748b" mb={3}>Tiền điện nước sẽ được tính riêng theo chỉ số tiêu thụ thực tế hàng tháng.</Typography>
            
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight="bold" mb={2} color="#1e293b">Nội thất & Tiện ích có sẵn:</Typography>
            <Grid container spacing={2}>
              {selectedRoom?.amenities && selectedRoom.amenities.length > 0 ? (
                selectedRoom.amenities.map((item, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <CheckIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body1" color="#475569" fontWeight="500">{item}</Typography>
                    </Stack>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography variant="body1" color="#ef4444" sx={{ fontStyle: 'italic' }}>* Phòng này hiện chưa được trang bị thiết bị nào.</Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, px: 4, borderTop: '1px solid #ebebeb' }}>
            <Button onClick={() => setSelectedRoom(null)} color="inherit" sx={{ fontWeight: 'bold', px: 3, transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>Hủy</Button>
            <Button variant="contained" sx={{ fontWeight: 'bold', borderRadius: '8px', bgcolor: '#f97316', transition: '0.2s', '&:hover': {bgcolor: '#ea580c', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'}, px: 4, py: 1.5 }} onClick={() => { setOpenLegalDialog(true); }}>
              Đăng ký thuê
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openLegalDialog} onClose={() => setOpenLegalDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
          <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #ebebeb', p: 3 }}>ĐIỀU KHOẢN & CAM KẾT</DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ bgcolor: '#f8fafc', p: 4, borderRadius: '12px', border: '1px solid #e2e8f0', height: '300px', overflowY: 'auto', mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>Điều 1. Nghĩa vụ tài chính</Typography>
              <Typography variant="body1" mb={3} color="#475569">Thanh toán tiền phòng và tiền điện nước đúng hạn.</Typography>
            </Box>
            <FormControlLabel control={<Checkbox checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} color="warning" size="large" />} label={<Typography variant="h6" fontWeight="bold">Tôi đã đọc và cam kết tuân thủ.</Typography>} />
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #ebebeb' }}>
            <Button onClick={() => setOpenLegalDialog(false)} color="inherit" sx={{ fontWeight: 'bold', px: 3, transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>Hủy</Button>
            <Button variant="contained" disabled={!isAgreed || submitting} onClick={handleRequestRoom} sx={{ fontWeight: 'bold', borderRadius: '8px', bgcolor: '#f97316', transition: '0.2s', '&:hover': {bgcolor: '#ea580c', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'}, px: 4, py: 1.5 }}>
              Đồng ý & Gửi yêu cầu
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Paper elevation={3} sx={{ display: 'flex', alignItems: 'center', p: '12px 24px', borderRadius: '12px', minWidth: '300px', bgcolor: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2.5, bgcolor: toast.type === 'success' ? '#f0fdf4' : (toast.type === 'error' ? '#fef2f2' : '#fffbeb') }}>
              {toast.type === 'success' ? <CheckCircleIcon sx={{ color: '#86efac', fontSize: 32 }} /> : <WarningAmberIcon sx={{ color: toast.type === 'error' ? '#fca5a5' : '#fcd34d', fontSize: 32 }} />}
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>
              {toast.message}
            </Typography>
          </Paper>
        </Snackbar>

      </Box>
    );
  }

  return (
    <Box sx={containerStyle}>
      <Box sx={{ mb: 5, pb: 3, borderBottom: '2px solid #f0f0f0' }}>
        <Typography variant="h4" fontWeight="900" color="#1e293b" mb={1}>Chào buổi sáng, {data.studentName}!</Typography>
        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 'normal' }}>Chúc bạn một ngày học tập thật hiệu quả.</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={7}>
          <Stack spacing={4}>
            
            {/* THẺ 1: Trạng thái Thanh toán */}
            {data.billing.status === 'unpaid' ? (
              <Card sx={{ borderRadius: '12px', border: '1px solid #fca5a5', bgcolor: '#fef2f2', boxShadow: 'none', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(239, 68, 68, 0.1)' } }}>
                <CardContent sx={{ p: { xs: 3, md: 4, lg: 5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <WarningAmberIcon sx={{ color: '#ef4444', fontSize: 40 }} />
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="#991b1b" mb={0.5}>Hóa đơn {data.billing.month} chưa thanh toán</Typography>
                      <Typography variant="body1" color="#b91c1c">Hạn chót: <strong>{data.billing.dueDate}</strong></Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={4}>
                    <Typography variant="h4" fontWeight="900" color="#ef4444">{formatCurrency(data.billing.amount)}</Typography>
                    
                    {/* Nút thanh toán MoMo */}
                    <Button 
                      variant="contained" 
                      color="error" 
                      size="large" 
                      disabled={paying}
                      onClick={handlePayment}
                      sx={{ 
                        borderRadius: '8px', fontWeight: 'bold', textTransform: 'none', px: 4, py: 1.5, boxShadow: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': { bgcolor: '#dc2626', transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)' }
                      }}
                    >
                      {paying ? 'Đang chuyển hướng...' : 'Thanh toán ngay'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ borderRadius: '12px', border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', boxShadow: 'none' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 36 }} />
                  <Typography variant="h6" fontWeight="bold" color="#166534">Tuyệt vời! Bạn đã thanh toán đủ cước phí tháng này.</Typography>
                </CardContent>
              </Card>
            )}

            {/* THẺ 2: Thông tin Lưu trú */}
            <Card sx={{ borderRadius: '12px', border: '1px solid #ebebeb', boxShadow: 'none' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight="bold" color="#1e293b">Thông tin lưu trú</Typography>
                  <Button 
                    endIcon={<ArrowForwardIosIcon sx={{ fontSize: '14px !important' }}/>} 
                    size="large" 
                    sx={{ 
                      textTransform: 'none', fontWeight: 'bold', color: '#2563eb', fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#eff6ff', borderRadius: '8px', px: 2 }
                    }}
                  >
                     Chi tiết phòng
                  </Button>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', transition: '0.3s', '&:hover': { borderColor: '#cbd5e1', bgcolor: 'white' } }}>
                      <Typography variant="subtitle2" color="#64748b" display="block" mb={1} textTransform="uppercase">Phòng hiện tại</Typography>
                      <Typography variant="h5" fontWeight="900" color="#2563eb">{data.room.name}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', transition: '0.3s', '&:hover': { borderColor: '#cbd5e1', bgcolor: 'white' } }}>
                      <Typography variant="subtitle2" color="#64748b" display="block" mb={1} textTransform="uppercase">Loại phòng</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#1e293b">{data.room.type}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', transition: '0.3s', '&:hover': { borderColor: '#cbd5e1', bgcolor: 'white' } }}>
                      <Typography variant="subtitle2" color="#64748b" display="block" mb={1} textTransform="uppercase">Hạn hợp đồng</Typography>
                      <Typography variant="h6" fontWeight="bold" color="#1e293b">{data.room.endDate}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* THẺ 3: Bảo trì */}
            <Card sx={{ borderRadius: '12px', border: '1px solid #ebebeb', boxShadow: 'none' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight="bold" color="#1e293b">Bảo trì gần đây</Typography>
                  <Button 
                    size="large" 
                    sx={{ 
                      textTransform: 'none', fontWeight: 'bold', color: '#64748b', fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: '#f1f5f9', color: '#1e293b', borderRadius: '8px', px: 2 }
                    }}
                  >
                    Xem tất cả
                  </Button>
                </Stack>
                
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2.5, borderTop: '1px solid #f1f5f9' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="#1e293b" mb={0.5}>{data.maintenance.title}</Typography>
                    <Typography variant="body1" color="#94a3b8">Gửi lúc: {data.maintenance.date}</Typography>
                  </Box>
                  <Chip label={data.maintenance.status} sx={{ bgcolor: '#fef08a', color: '#ca8a04', fontWeight: 'bold', borderRadius: '6px', px: 2, py: 2.5, fontSize: '14px' }} />
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>

        {/* CỘT PHẢI (Sidebar) */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: '12px', border: '1px solid #ebebeb', boxShadow: 'none', height: '100%', bgcolor: '#fafafa' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" fontWeight="bold" color="#1e293b" mb={4}>Bảng tin KTX</Typography>
              
              <Stack spacing={2.5} sx={{ flexGrow: 1 }}>
                {data.events.map((event) => (
                  <Box 
                    key={event.id} 
                    sx={{ 
                      p: 3, borderRadius: '10px', bgcolor: 'white', border: '1px solid #ebebeb', 
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: '#94a3b8', cursor: 'pointer', transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(0,0,0,0.06)' } 
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Chip 
                        label={event.type === 'warning' ? 'Cảnh báo' : event.type === 'maintenance' ? 'Bảo trì' : 'Thông tin'} 
                        size="small" 
                        sx={{ 
                          bgcolor: event.type === 'warning' ? '#fef3c7' : event.type === 'maintenance' ? '#fee2e2' : '#eff6ff', 
                          color: event.type === 'warning' ? '#d97706' : event.type === 'maintenance' ? '#dc2626' : '#2563eb',
                          fontWeight: 'bold', fontSize: '12px', height: '24px', borderRadius: '4px', px: 1
                        }} 
                      />
                      <Typography variant="body2" color="#94a3b8" fontWeight="500">{event.date}</Typography>
                    </Stack>
                    <Typography variant="body1" fontWeight="bold" color="#1e293b" sx={{ lineHeight: 1.5 }}>
                      {event.title}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              
              <Button 
                fullWidth 
                variant="outlined" 
                size="large" 
                sx={{ 
                  mt: 4, borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', fontSize: '1rem', color: '#1c4f9f', borderColor: '#d4d4d8', py: 1.5,
                  transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: '#7e9cba', borderColor: '#94a3b8', transform: 'translateY(-2px)' } 
                }}
              >
                Xem tất cả thông báo
              </Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
      
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Paper elevation={3} sx={{ display: 'flex', alignItems: 'center', p: '12px 24px', borderRadius: '12px', minWidth: '300px', bgcolor: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2.5, bgcolor: toast.type === 'success' ? '#f0fdf4' : (toast.type === 'error' ? '#fef2f2' : '#fffbeb') }}>
            {toast.type === 'success' ? <CheckCircleIcon sx={{ color: '#86efac', fontSize: 32 }} /> : <WarningAmberIcon sx={{ color: toast.type === 'error' ? '#fca5a5' : '#fcd34d', fontSize: 32 }} />}
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>
            {toast.message}
          </Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
}