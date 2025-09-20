"use server";

import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10).max(500),
});

interface SubmitInquiryResult {
  success: boolean;
  error?: string;
}

export async function submitInquiry(
  data: z.infer<typeof contactFormSchema>
): Promise<SubmitInquiryResult> {
  const validationResult = contactFormSchema.safeParse(data);

  if (!validationResult.success) {
    // Simplified error handling for now
    const firstError = validationResult.error.errors[0];
    return { success: false, error: `${firstError.path.join('.')}: ${firstError.message}` };
  }

  // Simulate processing the inquiry (e.g., sending an email, saving to database)
  console.log("New inquiry received:", validationResult.data);

  // Simulate potential delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate a random failure for demonstration
  // if (Math.random() < 0.3) {
  //   return { success: false, error: "A simulated random error occurred. Please try again." };
  // }

  return { success: true };
}
