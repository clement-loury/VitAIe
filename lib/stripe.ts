import Stripe from "stripe";

// Client Stripe (null si non configuré)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

// Plans disponibles
export const PLANS = {
  free: {
    name: "FREE",
    price: 0,
    limites: { cvParMois: 1, lettresParMois: 1 },
  },
  pro: {
    name: "PRO",
    price: 12,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    limites: { cvParMois: Infinity, lettresParMois: Infinity },
  },
  boost: {
    name: "BOOST",
    price: 29,
    priceId: process.env.STRIPE_BOOST_PRICE_ID,
    limites: { cvParMois: Infinity, lettresParMois: Infinity },
  },
} as const;
