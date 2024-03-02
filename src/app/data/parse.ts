import type { Circuit, Driver, Race, Result, Season } from './types';

const parseNumberOrUndefined = (value: string): number | undefined => {
  return value === '\\N' ? undefined : +value;
};

const parseStringOrUndefined = (value: string): string | undefined => {
  return value === '\\N' ? undefined : value;
};

const parseDateOrUndefined = (value: string): Date | undefined => {
  return value === '\\N' ? undefined : new Date(value);
};

export const parseDriver = (d: any): Driver => ({
  driverId: +d['driverId'],
  driverRef: d['driverRef'],
  number: parseNumberOrUndefined(d['number']),
  code: parseStringOrUndefined(d['code']),
  forename: d['forename'],
  surname: d['surname'],
  dob: new Date(d['dob']),
  nationality: d['nationality'],
  url: d['url'],
});

export const parseSeason = (d: any): Season => ({
  year: +d['year'],
  url: d['url'],
});

export const parseRace = (d: any): Race => ({
  raceId: +d['raceId'],
  year: +d['year'],
  round: +d['round'],
  circuitId: +d['circuitId'],
  name: d['name'],
  date: new Date(d['date']),
  time: parseStringOrUndefined(d['time']),
  url: d['url'],
  fp1Date: parseDateOrUndefined(d['fp1_date']),
  fp1Time: parseStringOrUndefined(d['fp1_time']),
  fp2Date: parseDateOrUndefined(d['fp2_date']),
  fp2Time: parseStringOrUndefined(d['fp2_time']),
  fp3Date: parseDateOrUndefined(d['fp3_date']),
  fp3Time: parseStringOrUndefined(d['fp3_time']),
  qualiDate: parseDateOrUndefined(d['quali_date']),
  qualiTime: parseStringOrUndefined(d['quali_time']),
  sprintDate: parseDateOrUndefined(d['sprint_date']),
  sprintTime: parseStringOrUndefined(d['sprint_time']),
});

export const parseCircuit = (d: any): Circuit => ({
  circuitId: +d['circuitId'],
  circuitRef: d['circuitRef'],
  name: d['name'],
  location: d['location'],
  country: d['country'],
  lat: +d['lat'],
  lng: +d['lng'],
  alt: parseNumberOrUndefined(d['alt']),
  url: d['url'],
});

export const parseResult = (d: any): Result => ({
  resultId: +d['resultId'],
  raceId: +d['raceId'],
  driverId: +d['driverId'],
  constructorId: +d['constructorId'],
  number: parseNumberOrUndefined(d['number']),
  grid: +d['grid'],
  position: parseNumberOrUndefined(d['position']),
  positionText: d['positionText'],
  positionOrder: +d['positionOrder'],
  points: +d['points'],
  laps: +d['laps'],
  time: parseStringOrUndefined(d['time']),
  milliseconds: parseNumberOrUndefined(d['milliseconds']),
  fastestLap: parseNumberOrUndefined(d['fastestLap']),
  rank: parseNumberOrUndefined(d['rank']),
  fastestLapTime: parseStringOrUndefined(d['fastestLapTime']),
  fastestLapSpeed: parseNumberOrUndefined(d['fastestLapSpeed']),
  statusId: +d['statusId'],
});
