export interface CreateBookingInput {
  id: string;
  source: string;
  checkIn: string;
  checkOut: string;
}

export interface CreateBookingArgs {
  input: CreateBookingInput;
}


