import { createTRPCRouter, protectedProcedure } from "../trpc";
import Stripe from "stripe";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../db";
import { getCustomerId } from "../../../utils/stripe-utils";

const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-12-15.clover",
});

export const accountRouter = createTRPCRouter({
  subscribe: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.session?.user?.id,
      },
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      success_url: env.NEXTAUTH_URL,
      cancel_url: env.NEXTAUTH_URL,
      mode: "subscription",
      line_items: [
        {
          price: env.STRIPE_SUBSCRIPTION_PRICE_ID ?? "",
          quantity: 1,
        },
      ],
      customer: user.customerId ?? undefined,
      customer_email: user.email ?? undefined,
      client_reference_id: ctx.session?.user?.id,
      metadata: {
        userId: ctx.session?.user?.id,
      },
    });

    return checkoutSession.url;
  }),
  manage: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session?.user?.subscriptionId) {
      return null;
    }

    const sub = await stripe.subscriptions.retrieve(
      ctx.session?.user?.subscriptionId
    );

    const session = await stripe.billingPortal.sessions.create({
      customer: getCustomerId(sub.customer),
      return_url: env.NEXTAUTH_URL,
    });

    return session.url;
  }),
});
