const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     
    await client.connect();
    // Send a ping to confirm a successful connection

    const pets = await client.db('pet');
    app.get('/allpets',async(req,res) => {
        const petData = await pets.collection('pet').find().toArray();
        res.send(petData);
    })
    app.get('/6pets' , async (req,res) => {
        const petData = await pets.collection('pet').find().toArray();
        const sixPetData = [];
        for(let i = 0;i<6;i++){
            sixPetData.push(petData[i]);
        }
        res.send(sixPetData);

    })
    


  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("api working");
});

//Running server

app.listen(5000, () => {
  console.log("server-running ....");
});
