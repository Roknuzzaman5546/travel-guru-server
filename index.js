const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const stripe = require("stripe")(process.env.SCREET_KEY)
const app = express();
const port = process.env.PORT || 5000;

// midllware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m8ywqwd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const placecollection = client.db('traveldb').collection('place')
        const userscollection = client.db('traveldb').collection('users')
        const hotelscollection = client.db('traveldb').collection('hotel')
        const reviewscollection = client.db('traveldb').collection('reviews')
        const choicelistcollection = client.db('traveldb').collection('choicelist')

        // Place related Api

        app.get('/place', async (req, res) => {
            const result = await placecollection.find().toArray();
            res.send(result)
        })

        app.post('/place', async (req, res) => {
            const place = req.body;
            const result = await placecollection.insertOne(place)
            res.send(result)
        })

        // Users Related Api

        app.post('/users', async (req, res) => {
            const userInfo = req.body;
            const result = await userscollection.insertOne(userInfo)
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const result = await userscollection.find().toArray()
            res.send(result)
        })

        // Hotel related Api

        app.get('/hotel', async (req, res) => {
            const result = await hotelscollection.find().toArray();
            res.send(result);
        })

        app.post('/hotel', async (req, res) => {
            const hotel = req.body;
            const result = await hotelscollection.insertOne(hotel)
            res.send(result)
        })
        // Destination related Api

        app.post('/choicelist', async (req, res) => {
            const placebook = req.body;
            const result = await choicelistcollection.insertOne(placebook)
            res.send(result)
        })

        app.get('/choicelist', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await choicelistcollection.find(query).toArray()
            res.send(result)
        })

        app.get('/destination', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await destinationscollection.find(query).toArray()
            res.send(result)
        })

        // Review related api

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewscollection.insertOne(review)
            res.send(result)
        })

        // Payment section

        app.post('/create-payment-intent', async (req, res) => {
            const { cost } = req.body;
            const ammount = parseInt(cost * 100)
            console.log(ammount, 'ammount inside client')

            const paymentIntent = await stripe.paymentIntents.create({
                ammount: ammount,
                currency: "usd",
                payment_method_types: ['card'],
            })
            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Travel gur is running')
})

app.listen(port, () => {
    console.log(`Travel guru is running on ${port}`)
})