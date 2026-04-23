import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);


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


export const showConfirm = (title, text) => {
  return MySwal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#5ec95e',
    cancelButtonColor: '#b13737',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    background: '#ffffff',
    width: '400px',        
    padding: '1.5em 1em',  
    didOpen: () => {
      document.querySelector('.swal2-container').style.setProperty('z-index', '99999', 'important');
    }
  });
};


export const showAlert = (title, text, icon = 'error') => {
  return MySwal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonColor: '#2563eb',
    background: '#ffffff',
    width: '400px',        
    padding: '1.5em 1em',  
    didOpen: () => {
      document.querySelector('.swal2-container').style.setProperty('z-index', '99999', 'important');
    }
  });
};