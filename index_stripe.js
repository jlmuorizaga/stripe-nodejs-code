const express = require("express");
const Stripe = require('stripe');
const cors = require("cors");
const db=require('./queries_stripe');
//const stripe = Stripe('sk_test_51LSBydIjGNO1QnMz4u33zcYR4KGC6zO9x5XvjMd2DksvDMG0JFlY3p3BiYmNnGzpL0AwanqYg9tupyzcWFSIzrbP00AcbupLT4');
//const stripe = Stripe('sk_test_51NtbqUGiYQWlTFKFdQELcj0lfgqvOuLJO2LPwjiBQQtwQMu9J3XgiVDFZvZHeuZeMgOFJBVVIgifohkuEbJkqkEW00yKVwlbAM');

const app = express();

app.use(express.json());
app.use(cors());

const port = 3002;
const host = "localhost";

app.get('/keysBySucursal/:id_clave',db.getKeysBySucursal);

app.post("/payment-sheet", async(req, res, next) => {

    try {
        const data = req.body;
        console.log(req.body);
        const sucursal=data.sucursal;
        const sk=data.sk;      
        console.log('Sucursal del lado del servidor='+sucursal);
        console.log('sk del lado del servidor='+sk);

        const params = {
            email: data.email,
            name: data.name,
        };

        let stripe;
        stripe = Stripe(sk);
        console.log('****** sk:'+sk);
       /* if (sucursal==='01AME'){            
            stripe = Stripe('sk_test_51LSBydIjGNO1QnMz4u33zcYR4KGC6zO9x5XvjMd2DksvDMG0JFlY3p3BiYmNnGzpL0AwanqYg9tupyzcWFSIzrbP00AcbupLT4');
        }else{
            stripe = Stripe('sk_test_51NtbqUGiYQWlTFKFdQELcj0lfgqvOuLJO2LPwjiBQQtwQMu9J3XgiVDFZvZHeuZeMgOFJBVVIgifohkuEbJkqkEW00yKVwlbAM');
        }*/


        const customer = await stripe.customers.create(params);
        console.log(customer.id);

        const ephemeralKey = await stripe.ephemeralKeys.create(
            {customer: customer.id},
            {apiVersion: '2020-08-27'}
        );
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(data.amount),
            currency: data.currency,
            customer: customer.id,
            payment_method_types: ["card"],
            //automatic_payment_methods: {
            //enabled: true,
            //payment_method:'card'
            //},
        });
        const response = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
        res.status(200).send(response);
    } catch(e) {
        next(e);
    }
});

app.listen(port, host, () => {
  console.log(`Server is running at ${port}`);
});