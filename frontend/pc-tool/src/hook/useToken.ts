import Cookies from 'js-cookie';

window.Cookies = Cookies;

let hostname = document.location.hostname || document.location.host;
let dot = hostname.indexOf('.');
let parentHost = hostname.substring(dot + 1);

export default function useToken() {
    let token = Cookies.get(`${parentHost} token`);
    token = token ? `Bearer ${token}` : '';
    return token;
}
