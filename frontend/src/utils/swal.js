import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// 1. Toast: Thông báo nhỏ hiện ở góc phải
export const showToast = (title, icon = 'success') => {
  return MySwal.fire({
    toast: true,
    position: 'top-end',
    icon: icon,
    title: title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#ffffff',
    color: '#1e293b',
    didOpen: () => {
      document.querySelector('.swal2-container').style.setProperty('z-index', '99999', 'important');
    }
  });
};

// 2. Confirm: Hộp thoại hỏi Xác nhận (Đã thu nhỏ kích thước)
export const showConfirm = (title, text) => {
  return MySwal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Hủy bỏ',
    background: '#ffffff',
    width: '400px',        // Thu nhỏ chiều rộng hộp thoại
    padding: '1.5em 1em',  // Căn chỉnh lại khoảng cách trên/dưới và trái/phải
    didOpen: () => {
      document.querySelector('.swal2-container').style.setProperty('z-index', '99999', 'important');
    }
  });
};

// 3. Alert: Hộp thoại thông báo tĩnh (Đã thu nhỏ kích thước)
export const showAlert = (title, text, icon = 'error') => {
  return MySwal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonColor: '#2563eb',
    background: '#ffffff',
    width: '400px',        // Thu nhỏ chiều rộng hộp thoại
    padding: '1.5em 1em',  // Căn chỉnh lại khoảng cách
    didOpen: () => {
      document.querySelector('.swal2-container').style.setProperty('z-index', '99999', 'important');
    }
  });
};