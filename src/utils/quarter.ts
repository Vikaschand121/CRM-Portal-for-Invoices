export interface QuarterRange {
  start: string;
  end: string;
}

export const getQuarterRange = (dateStr?: string): QuarterRange => {
  if (!dateStr) {
    return { start: '', end: '' };
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return { start: '', end: '' };
  }
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if ((month === 2 && day >= 25) || month === 3 || month === 4 || (month === 5 && day <= 23)) {
    return { start: `${year}-03-25`, end: `${year}-06-23` };
  }

  if ((month === 5 && day >= 24) || month === 6 || month === 7 || (month === 8 && day <= 28)) {
    return { start: `${year}-06-24`, end: `${year}-09-28` };
  }

  if ((month === 8 && day >= 29) || month === 9 || month === 10 || (month === 11 && day <= 24)) {
    return { start: `${year}-09-29`, end: `${year}-12-24` };
  }

  if (month === 11 && day >= 25) {
    return { start: `${year}-12-25`, end: `${year + 1}-03-24` };
  }

  return { start: `${year - 1}-12-25`, end: `${year}-03-24` };
};
