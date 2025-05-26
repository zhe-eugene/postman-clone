import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

export function showMessageWarning(message) {
  iziToast.warning({
    message: message,
    titleColor: '#fff',
    titleSize: '16px',
    titleLineHeight: '1.5',
    messageColor: '#fff',
    messageSize: '16px',
    messageLineHeight: '1.5',
    backgroundColor: '#ef4040',
    position: 'topCenter',
    timeout: 5000,
  });
}

export function showMessageSuccess(message) {
  iziToast.success({
    message: message,
    titleColor: '#fff',
    titleSize: '16px',
    titleLineHeight: '1.5',
    messageColor: '#fff',
    messageSize: '16px',
    messageLineHeight: '1.5',
    backgroundColor: 'green',
    position: 'topCenter',
    timeout: 5000,
  });
}

export function showMessageInfo(message) {
  iziToast.info({
    message: message,
    titleColor: '#fff',
    titleSize: '16px',
    titleLineHeight: '1.5',
    messageColor: '#000',
    messageSize: '16px',
    messageLineHeight: '1.5',
    backgroundColor: 'yellow',
    position: 'topCenter',
    timeout: 5000,
  });
}
