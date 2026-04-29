import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  Typography
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CampaignIcon from '@mui/icons-material/Campaign';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/notifications';
const DEFAULT_STORAGE_KEY = 'notifications_seen_keys';

const readSeenKeys = (storageKey) => {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const getTypeMeta = (type) => {
  switch (type) {
    case 'warning':
      return { icon: <WarningAmberIcon sx={{ color: '#d97706', fontSize: 20 }} />, label: 'Warning' };
    case 'maintenance':
      return { icon: <BuildIcon sx={{ color: '#dc2626', fontSize: 20 }} />, label: 'Maintenance' };
    case 'contract':
      return { icon: <AssignmentIcon sx={{ color: '#7c3aed', fontSize: 20 }} />, label: 'Contract' };
    case 'room':
      return { icon: <MeetingRoomIcon sx={{ color: '#0891b2', fontSize: 20 }} />, label: 'Room' };
    case 'payment':
      return { icon: <ReceiptLongIcon sx={{ color: '#059669', fontSize: 20 }} />, label: 'Payment' };
    case 'event':
      return { icon: <CampaignIcon sx={{ color: '#2563eb', fontSize: 20 }} />, label: 'Announcement' };
    default:
      return { icon: <InfoIcon sx={{ color: '#2563eb', fontSize: 20 }} />, label: 'Information' };
  }
};

export default function NotificationBell({ onViewAll, onNotificationClick, storageKey = DEFAULT_STORAGE_KEY }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seenKeys, setSeenKeys] = useState(() => readSeenKeys(storageKey));

  useEffect(() => {
    let isMounted = true;
    const role = localStorage.getItem('role') || 'student';
    const userId = localStorage.getItem('user_id') || '';
    const token = localStorage.getItem('token');

    axios.get(API_URL, {
      params: { role, user_id: userId },
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => {
        if (!isMounted) return;
        setNotifications(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error('Error loading notifications:', err))
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((item) => !seenKeys.includes(item.key)).length;
  const previewNotifications = notifications.slice(0, 7);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    if (notifications.length > 0) {
      const nextSeenKeys = Array.from(new Set([...seenKeys, ...notifications.map((item) => item.key)]));
      localStorage.setItem(storageKey, JSON.stringify(nextSeenKeys));
      setSeenKeys(nextSeenKeys);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    handleClose();
    if (onViewAll) onViewAll();
  };

  const handleNotificationClick = (notification) => {
    handleClose();
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <>
      <IconButton sx={{ color: '#64748b' }} onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: '16px',
            mt: 1.5,
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)'
          }
        }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="subtitle1" fontWeight="800" color="#1e293b">
            Notifications
          </Typography>
          <Typography variant="body2" color="#64748b">
            Latest dormitory updates
          </Typography>
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : previewNotifications.length === 0 ? (
          <Box sx={{ px: 2.5, py: 4 }}>
            <Typography variant="body2" color="#94a3b8" textAlign="center">
              No notifications available.
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {previewNotifications.map((notification) => {
              const typeMeta = getTypeMeta(notification.type);
              const isUnread = !seenKeys.includes(notification.key);

              return (
                <ListItem
                  key={notification.key}
                  disablePadding
                  sx={{
                    bgcolor: isUnread ? '#f8fafc' : 'white',
                    borderLeft: isUnread ? '3px solid #1c3d8c' : '3px solid transparent'
                  }}
                >
                  <ListItemButton
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ px: 2.5, py: 1.5 }}
                  >
                    <Box sx={{ pt: 0.5, mr: 1.5 }}>
                      {typeMeta.icon}
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="body2" fontWeight="700" color="#1e293b">
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="#94a3b8" sx={{ whiteSpace: 'nowrap' }}>
                            {notification.date_label || notification.created_at}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: '#1c3d8c', fontWeight: '700', mt: 0.25, mb: 0.5 }}
                          >
                            {typeMeta.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="#64748b"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {notification.description}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}

        <Divider />

        <Box sx={{ p: 1.5 }}>
          <Button
            onClick={handleViewAll}
            fullWidth
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: '700', color: '#1c3d8c' }}
          >
            View announcements
          </Button>
        </Box>
      </Menu>
    </>
  );
}
