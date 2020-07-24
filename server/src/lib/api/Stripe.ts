import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`)

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({
      /* eslint-disable @typescript-eslint/camelcase */
      grant_type: "authorization_code",
      code
      /* eslint-enable @typescript-eslint/camelcase */
    });
    return response;
  }
};
