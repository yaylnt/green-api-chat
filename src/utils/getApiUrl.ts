export const getApiUrl = (idInstance: number): string => {
  const id = idInstance.toString().slice(0, 4);
  return `https://${id}.api.green-api.com`;
};