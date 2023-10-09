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



function isIp(str:string = ''){
    return /((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/.test(str);
}