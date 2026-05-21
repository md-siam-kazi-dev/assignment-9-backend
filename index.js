const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

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
    //  get methond function

    const pets = await client.db("pet");

    app.get("/allpets", async (req, res) => {
      const petData = await pets.collection("pet").find().toArray();
      res.send(petData);
    });
    app.get("/6pets", async (req, res) => {
      const petData = await pets.collection("pet").find().toArray();
      const sixPetData = [];
      for (let i = 0; i < 6; i++) {
        sixPetData.push(petData[i]);
      }
      res.send(sixPetData);
    });
    app.get("/:id", async (req, res) => {
      const petData = await pets
        .collection("pet")
        .find({
          _id: new ObjectId(req.params.id),
        })
        .toArray();

       res.send(petData);
    });

    app.get('/user/:id',async(req,res) => {
      
      const user = await client.db('account').collection('account').find({
       email:req.params.id
      }).toArray()

      console.log(user)
      
      
      
      
      const petData = await pets.collection('pet').find({
        ownerEmail:user[0].email,
      }).toArray();
      res.send(petData)
      
    })

    //  post request function
    // add pet
    app.post("/addpet", async (req, res) => {
      const data = req.body;
      const petData = {
        petName: data.petName,
        species: data.species,
        breed: data.breed,
        age: {
          value: data.ageValue,
          unit: data.ageUnit,
        },
        gender: data.gender,
        imageUrl: data.imageUrl,
        healthStatus: data.healthStatus,
        vaccinationStatus: {
          isVaccinated: data.isVaccinated === "on" ? true : false,
          vaccines: data.vaccines.split(","),
        },
        location: {
          city: data.city,
          state: data.state,
          country: data.country,
        },
        adoptionFee: data.adoptionFee,
        description: data.description,
        ownerEmail: data.ownerEmail,
        listedAt: Date.now(),
        isAdopted: false,
      };
      const result = await pets.collection("pet").insertOne(petData);
      res.send(result);
    });
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
