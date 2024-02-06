export interface Race {
  raceId: number;
  year: number;
  round: number;
  circuitId: number;
  name: string;
  date: Date;
  time?: string;
  url: string;
  fp1Date?: Date;
  fp1Time?: string;
  fp2Date?: Date;
  fp2Time?: string;
  fp3Date?: Date;
  fp3Time?: string;
  qualiDate?: Date;
  qualiTime?: string;
  sprintDate?: Date;
  sprintTime?: string;
}
