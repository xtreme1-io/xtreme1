/** 将 query 转换为 url 拼接 */
export const parseParam = (url: string, params: any): string => {
  const queryParams =
    Object.keys(Object(params))
      .map((key) => `${key}=${params[key]}`)
      .join('&') ?? '';
  return `${url}?${queryParams}`;
};
