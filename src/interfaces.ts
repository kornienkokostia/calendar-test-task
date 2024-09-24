interface TimeSlot {
  bt: number;
  et: number;
}

export interface WeeklySchedule {
  [key: string]: TimeSlot[]
}