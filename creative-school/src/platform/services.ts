import { z } from "zod";
export const serviceCategories = [
  "logo",
  "branding",
  "video",
  "shorts",
  "photo",
  "3d",
  "presentation",
] as const;
export const offerSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(40).max(3000),
  category: z.enum(serviceCategories),
  price: z.number().int().min(100).max(10000000),
  days: z.number().int().min(1).max(90),
  revisions: z.number().int().min(0).max(20),
  deliverables: z.string().trim().min(5).max(500),
  active: z.boolean().default(true),
});
export const orderSchema = z
  .object({
    clientId: z.string().uuid(),
    offerId: z.string().uuid(),
    offerVersion: z.number().int().positive(),
    brief: z.string().trim().min(30).max(4000),
    contact: z.string().trim().min(3).max(200),
  })
  .strict();
export const orderStatuses = [
  "pending",
  "accepted",
  "in_progress",
  "delivered",
  "completed",
  "declined",
  "cancelled",
] as const;
export type ServiceOffer = z.infer<typeof offerSchema> & {
  id: string;
  seller_id: string;
  seller_name: string;
  version: number;
  created_at: string;
};
export type ServiceOrder = {
  id: string;
  offer_id: string;
  buyer_id: string;
  seller_id: string;
  title: string;
  price: number;
  days: number;
  revisions: number;
  deliverables: string;
  brief: string;
  contact: string;
  status: (typeof orderStatuses)[number];
  delivery_note: string;
  version: number;
  created_at: string;
  buyer_name: string;
  seller_name: string;
};
export function canTransitionOrder(
  status: string,
  next: string,
  seller: boolean,
) {
  return (
    (seller
      ? {
          pending: ["accepted", "declined"],
          accepted: ["in_progress", "declined"],
          in_progress: ["delivered"],
          delivered: ["in_progress"],
        }
      : {
          pending: ["cancelled"],
          accepted: ["cancelled"],
          delivered: ["completed"],
        })[status as "pending"]?.includes(next) ?? false
  );
}
