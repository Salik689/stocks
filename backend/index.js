import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // <-- Add path option

import express from 'express'
import cors from 'cors'
import clientPromise from './lib/mongodb.js'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())



app.get('/', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('inventory');
    const findResult = await collection.find({}).toArray();
    res.json(findResult);
})

app.post('/', async (req, res) => {
    try {
        const formData = req.body;
        const client = await clientPromise;
        const db = client.db('inventory');
        const collection = db.collection('stock');
        await collection.insertOne(formData);
        res.send({success: true});
    } catch (error) {
        res.status(500).send({success: false, error: error.message});
    }
})



app.listen(port, () => {
  console.log(`Example app listening on port localhost:${port}`)
})