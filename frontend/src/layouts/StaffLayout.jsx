import { Outlet, Link } from 'react-router-dom';

export default function StaffLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar Staff */}
      <aside style={{ width: '250px', background: '#047857', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>Staff Portal</h2>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5' }}>
          <li><Link to="/staff" style={{ color: 'white', textDecoration: 'none' }}>🔑 Quản lý phòng</Link></li>
          <li><Link to="/staff/students" style={{ color: '#a7f3d0', textDecoration: 'none' }}>👩‍🎓 Quản lý sinh viên</Link></li>
        </ul>
      </aside>

      <main style={{ flex: 1, padding: '30px' }}>
        <Outlet />
      </main>
    </div>
  );
}