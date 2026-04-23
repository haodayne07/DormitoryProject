import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Box, Grid, Card, CardContent, 
  Chip, Stack, TextField, InputAdornment, 
  Pagination, PaginationItem, CircularProgress, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CampaignIcon from '@mui/icons-material/Campaign';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BuildIcon from '@mui/icons-material/Build';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import axios from 'axios';

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [page, setPage] = useState(0);
  const rowsPerPage = 6; 

  const fetchData = useCallback(() => {
    axios.get('http://127.0.0.1:5000/api/events')
      .then(res => {
        const sortedEvents = res.data.sort((a, b) => b.event_id - a.event_id);
        setEvents(sortedEvents);
      })
      .catch(err => console.error("Error fetching events:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm cấu hình màu sắc và icon theo loại thông báo
  const getTypeConfig = (type) => {
    switch(type) {
      case 'warning': return { icon: <WarningAmberIcon fontSize="small" />, color: '#d97706', bgcolor: '#fef3c7', label: 'Warning' };
      case 'maintenance': return { icon: <BuildIcon fontSize="small" />, color: '#dc2626', bgcolor: '#fee2e2', label: 'Maintenance' };
      default: return { icon: <InfoIcon fontSize="small" />, color: '#2563eb', bgcolor: '#dbeafe', label: 'Information' };
    }
  };

  // Lọc thông báo theo từ khóa tìm kiếm
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 1, width: '100%', pb: 5 }}>
      {/* HEADER TÌM KIẾM */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} sx={{ mb: 5 }} spacing={3}>
        <Box>
          <Typography variant="h3" fontWeight="900" sx={{ color: '#1e3a8a', mb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CampaignIcon sx={{ fontSize: 40 }} /> Dormitory Newsboard
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 'normal' }}>
            Stay updated with the latest announcements and schedules from the Management Board.
          </Typography>
        </Box>
        
        <TextField 
          placeholder="Search announcements..." 
          size="medium" 
          value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }} 
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }}/></InputAdornment> }}
          sx={{ 
            width: { xs: '100%', sm: '350px' }, bgcolor: 'white', 
            '& .MuiOutlinedInput-root': { borderRadius: '12px', '& fieldset': { borderColor: '#cbd5e1' }, '&:hover fieldset': { borderColor: '#1e3a8a' } } 
          }}
        />
      </Stack>

      {}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : filteredEvents.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '20px', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', boxShadow: 'none' }}>
          <EventAvailableIcon sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" color="#64748b">No announcements found!</Typography>
          <Typography variant="body1" color="#94a3b8" mt={1}>Check back later for new updates from the dormitory.</Typography>
        </Paper>
      ) : (
        <Box>
          <Grid container spacing={4}>
            {filteredEvents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((event) => {
              const config = getTypeConfig(event.type);
              return (
                <Grid item xs={12} md={6} lg={4} key={event.event_id}>
                  <Card sx={{ 
                    height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: 'none',
                    transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderColor: '#cbd5e1' } 
                  }}>
                    <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip 
                          icon={config.icon} 
                          label={config.label} 
                          size="small" 
                          sx={{ bgcolor: config.bgcolor, color: config.color, fontWeight: 'bold', '& .MuiChip-icon': { color: config.color }, borderRadius: '6px' }} 
                        />
                        <Typography variant="caption" fontWeight="bold" color="#94a3b8" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                           {event.event_date}
                        </Typography>
                      </Stack>
                      
                      <Typography variant="h5" fontWeight="800" color="#1e293b" mb={2} sx={{ lineHeight: 1.4 }}>
                        {event.title}
                      </Typography>
                      
                      <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: '10px', flexGrow: 1, border: '1px solid #f1f5f9' }}>
                        <Typography variant="body1" color="#475569" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                          {event.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* PHÂN TRANG */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination 
              count={Math.ceil(filteredEvents.length / rowsPerPage) || 1} 
              page={page + 1} 
              onChange={(e, value) => setPage(value - 1)} 
              size="large"
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  components={{ 
                    previous: () => <span style={{ fontWeight: 'bold' }}>&lt; Previous</span>, 
                    next: () => <span style={{ fontWeight: 'bold' }}>Next &gt;</span> 
                  }}
                  sx={{
                    fontWeight: '600', color: '#64748b', fontSize: '15px', borderRadius: '12px', margin: '0 4px', px: 2,
                    '&.Mui-selected': { 
                      bgcolor: '#1e3a8a', color: 'white', border: 'none', 
                      boxShadow: '0 4px 10px rgba(30, 58, 138, 0.3)', '&:hover': { bgcolor: '#152b65' } 
                    },
                    '&.Mui-disabled': { opacity: 0.4 },
                    '&.MuiPaginationItem-previousNext': { 
                      color: '#64748b', bgcolor: 'transparent', 
                      '&:hover': { bgcolor: '#f1f5f9', color: '#1e3a8a' } 
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}