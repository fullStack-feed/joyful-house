interface BookingsIndexMonth {
  [key: string]: boolean;
}

interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth;
}

export interface BookingsIndex {
  [key: string]: BookingsIndexYear;
}
