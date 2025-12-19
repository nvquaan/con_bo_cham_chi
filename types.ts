
export enum CheckType {
  IN = 1,
  OUT = 2
}

export interface AttendancePayload {
  userID: string;
  typeCheckInOut: CheckType;
  dateCheckInOut: string;
}

export interface LogEntry extends AttendancePayload {
  id: string;
  timestamp: number;
  error?: string;
}
