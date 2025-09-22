

import * as z from 'zod';

export const shippingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  street: z.string().min(5, "Street address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  zipCode: z.string().min(5, "A valid zip code is required."),
  country: z.string(),
  phone: z.string().min(10, "A valid phone number is required."),
});

