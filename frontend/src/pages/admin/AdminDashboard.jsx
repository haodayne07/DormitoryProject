import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Paper, Stack, Avatar, Chip, Card } from '@mui/material';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import axios from 'axios';

const StatCard = ({ title, value, icon, trendValue, isNegative }) => (
  <Card sx={{ 
    p: 3.5, 
    borderRadius: '16px', 
    boxShadow: 'none', 
    border: '2px solid #1e3a8a', 
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.3s ease',
    '&:hover': { 
      transform: 'translateY(-4px)', 
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)', 
      borderColor: '#2563eb' 
    }
  }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
      <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Box sx={{ p: 1.2, backgroundColor: '#f8fafc', borderRadius: '12px', color: '#1e3a8a', display: 'flex' }}>
        {icon}
      </Box>
    </Stack>
    
    <Box>
      <Typography variant="h4" fontWeight="900" sx={{ color: '#1e293b', mb: 1.5 }}>
        {value}
      </Typography>
      
      <Stack direction="row" alignItems="center" spacing={0.5}>
        {isNegative ? <TrendingDownIcon sx={{ fontSize: 18, color: '#ef4444' }} /> : <TrendingUpIcon sx={{ fontSize: 18, color: '#10b981' }} />}
        <Typography variant="body2" sx={{ color: isNegative ? '#ef4444' : '#10b981', fontWeight: 'bold', fontSize: '14px' }}>
          {isNegative ? '-' : '+'}{trendValue}
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '14px' }}>
          from last month
        </Typography>
      </Stack>
    </Box>
  </Card>
);

export default function AdminDashboard() {
  const [activeChart, setActiveChart] = useState('occupancy'); 
  const [stats, setStats] = useState({
    total_students: 0,
    total_rooms: 0,
    available_rooms: 0,
    total_capacity: 0,
    active_contracts: 0,
    pending_requests: 0,
    total_revenue: 0,
    chart_data: [],
    revenue_chart_data: [] 
  });

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/dashboard/summary', getConfig())
      .then(res => setStats(res.data))
      .catch(err => console.error("Error loading dashboard:", err));
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const occupancyRate = stats.total_capacity > 0 
    ? Math.round((stats.active_contracts / stats.total_capacity) * 100) 
    : 0;

  return (
    <Box sx={{ p: 1, width: '100%' }}>
      
      <Box sx={{ mb: 4, pb: 2, borderBottom: '2px solid #f1f5f9' }}>
        <Typography variant="h3" fontWeight="900" sx={{ color: '#1e3a8a', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 'normal' }}>
          Welcome back! Here is the Dormitory overview.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Students" value={stats.total_students} icon={<PeopleOutlineIcon />} trendValue="12%" isNegative={false} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={<HomeOutlinedIcon />} trendValue="2.5%" isNegative={false} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Requests" value={stats.pending_requests} icon={<ErrorOutlineIcon />} trendValue="3" isNegative={stats.pending_requests > 0} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Revenue" value={formatCurrency(stats.total_revenue)} icon={<AttachMoneyIcon />} trendValue="8.3%" isNegative={false} />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <Chip 
          label="Occupancy Rate" 
          onClick={() => setActiveChart('occupancy')}
          sx={{ 
            backgroundColor: activeChart === 'occupancy' ? '#1e3a8a' : 'transparent', 
            color: activeChart === 'occupancy' ? 'white' : '#64748b', 
            fontWeight: 'bold', borderRadius: '12px', px: 2, py: 2.5, fontSize: '14px',
            border: activeChart === 'occupancy' ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
            cursor: 'pointer', transition: '0.2s',
            '&:hover': { backgroundColor: activeChart === 'occupancy' ? '#1e3a8a' : '#f8fafc' } 
          }} 
        />
        <Chip 
          label="Revenue (Payments)" 
          onClick={() => setActiveChart('payments')}
          sx={{ 
            backgroundColor: activeChart === 'payments' ? '#1e3a8a' : 'transparent', 
            color: activeChart === 'payments' ? 'white' : '#64748b', 
            fontWeight: 'bold', borderRadius: '12px', px: 2, py: 2.5, fontSize: '14px',
            border: activeChart === 'payments' ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
            cursor: 'pointer', transition: '0.2s',
            '&:hover': { backgroundColor: activeChart === 'payments' ? '#1e3a8a' : '#f8fafc' } 
          }} 
        />
      </Stack>

      <Card sx={{ p: { xs: 2, md: 4 }, borderRadius: '20px', boxShadow: 'none', border: '1px solid #f1f5f9' }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: '#1e293b', mb: 0.5 }}>
          {activeChart === 'occupancy' ? 'Room Occupancy Trend' : 'Revenue Trend'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 5 }}>
          {activeChart === 'occupancy' 
            ? 'Room occupancy over the last 6 months' 
            : 'Revenue fluctuation over the last 6 months'}
        </Typography>
        
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'occupancy' ? (
              <AreaChart data={stats.chart_data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0px 10px 30px rgba(0,0,0,0.1)' }} 
                  formatter={(value) => [`${value}%`, 'Occupancy Rate']}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            ) : (
              <BarChart data={stats.revenue_chart_data} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#94a3b8' }} tickFormatter={(value) => `${value / 1000000}M`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0px 10px 30px rgba(0,0,0,0.1)' }} 
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="value" fill="url(#colorRev)" radius={[8, 8, 0, 0]} barSize={45} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Card>
    </Box>
  );
}