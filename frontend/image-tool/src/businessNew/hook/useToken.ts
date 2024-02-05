import Cookies from 'js-cookie';

window.Cookies = Cookies;

let hostname = document.location.hostname || document.location.host;
// let dot = hostname.indexOf('.');
// let parentHost = isIp(hostname) ? hostname : hostname.substring(dot + 1);

export default function useToken() {
  let token = Cookies.get(`${hostname} token`);
  token = token ? `Bearer ${token}` : '';
  return token;
}
