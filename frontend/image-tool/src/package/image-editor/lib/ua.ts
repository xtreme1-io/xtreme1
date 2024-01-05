import UAParser, { IResult } from 'ua-parser-js';

export type IUserAgent = IResult & {
  isMac: boolean;
};

const parser = new UAParser();
let agent = parser.getResult();

let osName = (agent.os.name || '').toLowerCase();
const isMac = osName.indexOf('mac') >= 0;

let userAgent = agent as IUserAgent;
userAgent.isMac = isMac;

export default userAgent;
export { isMac };
