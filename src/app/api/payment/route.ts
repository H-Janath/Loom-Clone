import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET as string);

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ status: 404, message: "User not found" });
    }

    const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ status: 500, message: "Missing price ID" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"], // ensures card checkout
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment?canceled=true`,
      customer_email: user.emailAddresses[0]?.emailAddress, // ties session to Clerk user
    });

    return NextResponse.json({
      status: 200,
      session_url: session.url,
      customer_id: session.customer,
    });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ status: 500, message: error.message });
  }
}
