export interface Driver {
  driverId: number;
  driverRef: string;
  number?: number;
  code?: string;
  forename: string;
  surname: string;
  dob: Date;
  nationality: string;
  url: string;
}
