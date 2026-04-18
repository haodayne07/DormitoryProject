import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Typography, Avatar, IconButton, AppBar, Toolbar, Stack, Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HotelIcon from '@mui/icons-material/Hotel';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CampaignIcon from '@mui/icons-material/Campaign';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 260;
const collapsedWidth = 84; // Chiều rộng khi thu gọn Menu

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Quản lý trạng thái mở/đóng của 2 loại màn hình
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleMobileToggle = () => setMobileOpen(!mobileOpen);
  const handleDesktopToggle = () => setDesktopOpen(!desktopOpen);

  // Tính toán chiều rộng hiện tại dựa trên trạng thái
  const currentWidth = desktopOpen ? drawerWidth : collapsedWidth;

  const menuItems = [
    { text: 'Trang chủ', icon: <DashboardIcon />, path: '/student/dashboard' },
    { text: 'Phòng của tôi', icon: <HotelIcon />, path: '/student/room' },
    { text: 'Hóa đơn & Thanh toán', icon: <ReceiptLongIcon />, path: '/student/payments' },
    { text: 'Báo cáo sự cố', icon: <BuildCircleIcon />, path: '/student/maintenance' },
    { text: 'Bảng tin', icon: <CampaignIcon />, path: '/student/events' },
  ];

  // Hàm render nội dung Sidebar (Dùng chung cho cả Mobile và Desktop)
  const renderDrawerContent = (isExpanded) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1c3d8c', color: 'white', overflowX: 'hidden' }}>
      
      {/* HEADER CỦA SIDEBAR - ĐÃ ĐƯỢC CẬP NHẬT */}
      <Box sx={{ 
        p: isExpanded ? 3 : 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isExpanded ? 'space-between' : 'center', 
        transition: 'all 0.3s',
        minHeight: '80px' // Đảm bảo header luôn có độ cao cố định cho đẹp
      }}>
        {isExpanded ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'white', color: '#1c3d8c', fontWeight: 'bold' }}>S</Avatar>
              <Box sx={{ whiteSpace: 'nowrap' }}>
                <Typography variant="h6" fontWeight="900" color="white">DormHub</Typography>
                <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Student Portal</Typography>
              </Box>
            </Box>
            {/* Nút mũi tên thu gọn */}
            <IconButton 
              onClick={handleDesktopToggle} 
              sx={{ color: '#cbd5e1', '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }, display: { xs: 'none', sm: 'flex' } }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          // Nút Hamburger hiển thị khi Sidebar bị thu nhỏ (căn giữa)
          <IconButton 
            onClick={handleDesktopToggle} 
            sx={{ color: '#cbd5e1', '&:hover': { color: 'white', bgcolor: 'rgba(255, 255, 255, 0.1)' }, display: { xs: 'none', sm: 'flex' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* DANH SÁCH MENU */}
      <List sx={{ px: isExpanded ? 2 : 1.5, flexGrow: 1, mt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <Tooltip title={!isExpanded ? item.text : ""} placement="right" key={item.text} arrow>
              <ListItem 
                button 
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  mb: 1,
                  borderRadius: '12px',
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: isActive ? 'white' : '#94a3b8',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)', color: 'white' },
                  transition: 'all 0.2s ease-in-out',
                  justifyContent: isExpanded ? 'initial' : 'center',
                  px: isExpanded ? 2 : 0,
                  py: 1.2
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: '40px', justifyContent: isExpanded ? 'initial' : 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {isExpanded && (
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontWeight: isActive ? '800' : '600', fontSize: '14px', whiteSpace: 'nowrap' }} 
                  />
                )}
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

     {/* NÚT LOGOUT */}
      <Box sx={{ p: isExpanded ? 2 : 1.5 }}>
        <Tooltip title={!isExpanded ? "Đăng xuất" : ""} placement="right" arrow>
          <ListItem 
            button 
            // CẬP NHẬT ONCLICK ĐỂ XÓA TOKEN
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              localStorage.removeItem('user_id');
              navigate('/login');
            }} 
            sx={{ 
              borderRadius: '12px', 
              color: '#94a3b8', 
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white' },
              transition: 'all 0.2s ease-in-out',
              justifyContent: isExpanded ? 'initial' : 'center',
              px: isExpanded ? 2 : 0,
              py: 1.2
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '40px', justifyContent: isExpanded ? 'initial' : 'center' }}>
              <LogoutIcon />
            </ListItemIcon>
            {isExpanded && (
              <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }} />
            )}
          </ListItem>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER CỦA TRANG (AppBar) */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { sm: `calc(100% - ${currentWidth}px)` }, 
          ml: { sm: `${currentWidth}px` }, 
          bgcolor: 'white', 
          boxShadow: 'none', 
          borderBottom: '1px solid #f0f0f0',
          transition: 'width 0.3s, margin 0.3s'
        }}
      >
        <Toolbar>
          {/* Nút Menu cho màn hình Mobile (Vẫn giữ trên AppBar vì trên điện thoại Sidebar bị giấu đi) */}
          <IconButton color="inherit" edge="start" onClick={handleMobileToggle} sx={{ mr: 2, display: { sm: 'none' }, color: '#1e293b' }}>
            <MenuIcon />
          </IconButton>

          {/* ĐÃ XÓA NÚT MENU DESKTOP Ở ĐÂY VÌ ĐÃ CHUYỂN VÀO TRONG SIDEBAR */}

          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton sx={{ color: '#64748b' }}><NotificationsIcon /></IconButton>
            <Avatar sx={{ width: 35, height: 35, bgcolor: '#e2e8f0', color: '#1e293b', fontSize: '14px', fontWeight: 'bold' }}>SV</Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* KHU VỰC CHỨA SIDEBAR */}
      <Box component="nav" sx={{ width: { sm: currentWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s' }}>
        
        {/* Bản Mobile */}
        <Drawer 
          variant="temporary" 
          open={mobileOpen} 
          onClose={handleMobileToggle} 
          ModalProps={{ keepMounted: true }} 
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}
        >
          {renderDrawerContent(true)}
        </Drawer>

        {/* Bản Desktop */}
        <Drawer 
          variant="permanent" 
          sx={{ 
            display: { xs: 'none', sm: 'block' }, 
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentWidth, border: 'none', transition: 'width 0.3s', overflowX: 'hidden' } 
          }} 
          open
        >
          {renderDrawerContent(desktopOpen)}
        </Drawer>
      </Box>

      {/* KHU VỰC NỘI DUNG CHÍNH (Dashboard) */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { sm: `calc(100% - ${currentWidth}px)` }, mt: 7, transition: 'width 0.3s' }}>
        <Outlet />
      </Box>
    </Box>
  );
}