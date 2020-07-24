export interface LogInArgs {
  input: { code: string } | null;
}

export interface ConnectStripeArgs {
  input: { code: string };
}
