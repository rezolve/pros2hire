import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

exports.helloWorld = functions.https.onCall((data, context) => {
  console.log("helloWorld!!!!");
});

exports.createCustomer = functions.https.onCall(async (data, context) => {
  /* eslint-disable */
  const stripe = require("stripe")(functions.config().stripe.secret_key);
  const customer = await stripe.customers.create({
    description: "My First Test Customer (created for API docs at https://www.stripe.com/docs/api)",
  });
  return { id: customer.id };
});

exports.createAccount = functions.https.onCall(async (data, context) => {
  /* eslint-disable */
  const stripe = require("stripe")(functions.config().stripe.secret_key);
  const account = await stripe.accounts.create({
    type: 'custom',
    country: 'US',
    email: 'jenny.rosen@example.com',
    capabilities: {
      card_payments: {requested: true},
      transfers: {requested: true},
    },
  });
  return { id: account.id };
});

exports.createConnectedAccount = functions.https.onCall(async (data, context) => {
  /* eslint-disable */
  // Set your secret key. Remember to switch to your live secret key in production.
  // See your keys here: https://dashboard.stripe.com/apikeys
  console.log("account id = " + data.id);
  const stripe = require("stripe")(functions.config().stripe.secret_key);
  const accountLink = await stripe.accountLinks.create({
    account: data.id,
    refresh_url: "https://sauvier-2352a.web.app/",
    return_url: "https://sauvier-2352a.web.app/",
    type: 'account_onboarding',
  });
  return { url: accountLink.url };
});

exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  /* eslint-disable */
  const stripe = require("stripe")(functions.config().stripe.secret_key);
  const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "us_bank_account"],
      payment_method_options: {
        us_bank_account: {financial_connections: {permissions: ['payment_method']}}
      },
      mode: "payment",
      success_url: "https://sauvier-2352a.web.app/",
      cancel_url: "https://sauvier-2352a.web.app/",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: (100) * 100,
            product_data: {
              name: "New Camera"
            }
          }
        }
      ]
    });
    console.log("data = " + data.name);
    console.log("url = " + session.url);
    return { url: session.url };
});


exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = require("stripe")(functions.config().stripe.secret_key);

  let event;
  console.log("1");

  try {
    const whSec = functions.config().stripe.payments_webhook_secret;
    console.log("2");
    event = await stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        whSec,
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.");
    res.sendStatus(400);
  }

  console.log("3");
  const dataObject = event.data.object;

  console.log("dataObject = " + dataObject);

  await admin.firestore().collection("orders").doc().set({
    checkoutSessionId: dataObject.id,
    paymentStatus: dataObject.payment_status || null,
    shippingInfo: dataObject.shipping,
    amountTotal: dataObject.amount_total || null,
    customerDetails: dataObject.customer_details,
  });

  console.log("4");
  res.sendStatus(200);
});