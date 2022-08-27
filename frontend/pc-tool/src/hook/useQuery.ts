import queryString from 'query-string';

export default function useQuery() {
    let queryStr = location.href.split('?').reverse();
    const query = queryString.parse(queryStr[0] || '');
    return query;
}
