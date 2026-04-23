import React, { useState } from 'react';
import { Box, TextField, Button, Typography, InputAdornment, IconButton, Stack } from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon, Domain as DomainIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../../utils/swal';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:5000/api/auth/login', formData)
      .then(res => {
        const { token, role, user_id } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('user_id', user_id);

      
        showToast(`Welcome back, ${formData.username}!`, 'success');
        
        if (role === 'admin') navigate('/admin');
        else navigate('/student/dashboard');
      })
      .catch(err => {
        showToast(err.response?.data?.message || 'Login failed', 'error');
      });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#ffffff' }}>
      
      {/* ========================================================= */}
      {/* LEFT HALF: BRANDING AREA (Hidden on small screens) */}
      {/* ========================================================= */}
      <Box 
        sx={{ 
          flex: { xs: 0, md: 1.2 }, 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#f8fafc',
          p: 6,
          backgroundImage: `
            linear-gradient(rgba(30, 58, 138, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30, 58, 138, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      >
        <Box sx={{ position: 'absolute', top: '10%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.1), rgba(255, 255, 255, 0))', filter: 'blur(30px)' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.08), rgba(255, 255, 255, 0))', filter: 'blur(40px)' }} />

        <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'relative', zIndex: 2, mb: 'auto' }}>
          <DomainIcon sx={{ color: '#1e3a8a', fontSize: 32 }} />
          <Typography variant="h6" fontWeight="900" color="#1e3a8a" letterSpacing={1}>
            DORMHUB
          </Typography>
        </Stack>

        <Box sx={{ position: 'relative', zIndex: 2, mt: 'auto', mb: 'auto', pl: 4 }}>
          <Typography variant="overline" fontWeight="bold" sx={{ color: '#f59e0b', letterSpacing: 2 }}>
            SMART DORMITORY SYSTEM
          </Typography>
          
          <Typography variant="h2" fontWeight="400" sx={{ color: '#475569', mt: 2, lineHeight: 1.2 }}>
            Experience a perfect <br />
            <span style={{ fontWeight: '900', color: '#1e3a8a' }}>living and learning</span> <br />
            environment.
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#64748b', mt: 3, maxWidth: '400px' }}>
            A seamless platform connecting students and management for optimal, safe, and efficient dormitory operations.
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 6 }}>
             <Box sx={{ bgcolor: 'white', px: 2, py: 1, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
               <Typography variant="caption" color="#94a3b8" display="block">Project</Typography>
               <Typography variant="body2" fontWeight="bold" color="#1e293b">Capstone Project</Typography>
             </Box>
             <Box sx={{ bgcolor: 'white', px: 2, py: 1, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
               <Typography variant="caption" color="#94a3b8" display="block">Version</Typography>
               <Typography variant="body2" fontWeight="bold" color="#1e293b">1.0.0 (2026)</Typography>
             </Box>
          </Stack>
        </Box>
      </Box>

      {/* ========================================================= */}
      {/* RIGHT HALF: LOGIN FORM AREA */}
      {/* ========================================================= */}
      <Box 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: { xs: 4, sm: 8, md: 10 },
          bgcolor: 'white'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '400px' }}>
          
          <Box sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: 'flex', md: 'none' }, mb: 4 }}>
              <DomainIcon sx={{ color: '#1e3a8a', fontSize: 28 }} />
              <Typography variant="h6" fontWeight="900" color="#1e3a8a">DORMHUB</Typography>
            </Stack>

            <Typography variant="h4" fontWeight="500" color="#1e293b" mb={1}>
              Sign in
            </Typography>
            <Typography variant="body2" color="#64748b">
              DormHub — Internal Dormitory Management System
            </Typography>
          </Box>
          
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth 
              placeholder="Username"
              variant="outlined" 
              margin="normal"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#1e3a8a', borderWidth: '1px' },
                } 
              }}
            />
            
            <TextField
              fullWidth 
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined" 
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#1e3a8a', borderWidth: '1px' },
                } 
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              fullWidth 
              size="large" 
              type="submit"
              variant="contained" 
              startIcon={<LoginIcon />}
              sx={{ 
                mt: 4, 
                py: 1.8, 
                borderRadius: '10px', 
                bgcolor: '#1e3a8a', 
                fontWeight: 'bold', 
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(30, 58, 138, 0.2)',
                '&:hover': { bgcolor: '#172554', boxShadow: '0 6px 20px rgba(30, 58, 138, 0.3)' }
              }}
            >
              Sign In
            </Button>
          </form>

          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 6, color: '#94a3b8' }}>
            Authorized access for students and management only. <br/>
            Contact Student Affairs if you forget your password.
          </Typography>

        </Box>
      </Box>
    </Box>
  );
}