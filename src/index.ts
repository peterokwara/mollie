import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { MollieService } from "./services/MollieService";
import bodyParser from "body-parser";

dotenv.config();

const app: Express = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req: Request, res: Response) => {
  const mollieService = new MollieService();

  const customer = await mollieService.createCustomer({
    name: "John Doe",
    email: "",
    locale: "",
    metadata: {
      foo: "bar",
    },
  });

  const customerID = customer.id;

  const payment = await mollieService.createPayment({
    customerId: customerID,
    description: "Test payment",
    sequenceType: "first",
    redirectUrl: "https://app.goomza.co/",
    amount: {
      currency: "EUR",
      value: "10.00",
    },
  });

  console.log(payment["_links"]["checkout"]["href"], "the checkout url");

  await new Promise((resolve) => setTimeout(resolve, 40000));

  const mandate = await mollieService.getMandate(customerID);
  console.log(JSON.stringify(mandate), "the mandate");
  console.log(mandate["_embedded"]["mandates"], "the mandate url");

  mandate["_embedded"]["mandates"].forEach(async (mandate: any) => {
    if (mandate.status === "valid") {
      const payment = await mollieService.createSubscription({
        amount: {
          currency: "EUR",
          value: "10.00",
        },
        description: "Test payment",
        webhookUrl: "https://15a3-41-212-57-56.ngrok-free.app/api/webhook",
        mandateId: mandate.id,
        interval: "3 months",
        times: 4,
        customerId: customerID,
      });

      console.log(payment, "the payment");
    }
  });

  // const checkoutUrl2 = await mollieService.createPayment2({
  //   customerId: customerID,
  //   description: "Test payment",
  //   sequenceType: "recurring",
  //   webhookUrl:"https://15a3-41-212-57-56.ngrok-free.app/api/webhook",
  //   amount: {
  //     currency: "EUR",
  //     value: "10.00",
  //   },
  // });

  //   console.log(checkoutUrl2);

  res.send("Express + TypeScript Server");
});

app.post("/api/webhook", async (req: Request, res: Response) => {
  const id = await req.body.id;
console.log(id, "the id")
  if (id) {
    const mollieService = new MollieService();
    const payment = await mollieService.getPayment(id);
    console.log(payment["status"], "the payment");
  }
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
