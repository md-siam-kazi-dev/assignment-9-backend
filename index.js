const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jose = require("jose-cjs");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const JWKS = jose.createRemoteJWKSet(
  new URL("http://localhost:3000/api/auth/jwks"),
);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = async (req, res, next) => {
  const authToken = req.headers.authorization.split(" ")[1];
  if (!authToken) {
    return res.status(401).json({
      msg: "Unauthoized",
    });
  }
  try {
    const { payload } = await jose.jwtVerify(authToken, JWKS);
    console.log("ok");
    next();
  } catch (err) {
    console.log(authToken);
    return res.status(403).json({
      msg: "forbidden",
    });
  }
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    await client.connect();
    // Send a ping to confirm a successful connection
    //  get methond function

    const pets = await client.db("pet");

    app.get("/allpets", async (req, res) => {
      const search = req.query.search || "";
      console.log(search);
      let quary = {};
      if (search) {
        quary = {
          petName: {
            $regex: search,
            $options: "i",
          },
        };
      }

      const petData = await pets.collection("pet").find(quary).toArray();
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

    //added very token
    app.get("/:id", verifyToken, async (req, res) => {
      console.log(req.headers.authorization);
      const petData = await pets
        .collection("pet")
        .find({
          _id: new ObjectId(req.params.id),
        })
        .toArray();

      res.send(petData);
    });

    app.get("/user/:id", async (req, res) => {
      console.log(req.params.id);

      const petData = await pets
        .collection("pet")
        .find({
          ownerEmail: req.params.id,
        })
        .toArray();

      // const petData = await pets.collection('pet').find({
      //   ownerEmail:user[0].email,
      // }).toArray();
      res.send(petData);
    });

    app.get("/pet/req", verifyToken, async (req, res) => {
      const petReqData = await pets.collection("petreq").find().toArray();
      console.log(petReqData);
      res.send(petReqData);
    });

    //  post request function
    // add pet
    app.post("/addpet", verifyToken, async (req, res) => {
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

    app.post("/pet/req", async (req, res) => {
      const data = req.body;
      console.log(data);

      const msg = await pets
        .collection("petreq")
        .find({
          "pet._id": data.pet._id,
          "user.email": data.user.email,
        })
        .toArray();
      if (msg.length != 0) {
        res.send({
          requested: "Already Requested",
        });
      } else {
        const rslt = await pets.collection("petreq").insertOne({
          status: "pending",
          ...data,
        });
        res.send(rslt);
      }
    });

    // delete
    app.delete("/pet/:id", async (req, res) => {
      const result = await pets.collection("pet").deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.delete("/pet/req/:id", async (req, res) => {
      const result = await pets.collection("petreq").deleteOne({
        "pet._id": req.params.id,
      });
      console.log(result);
      res.send(result);
    });
    app.delete("/addpet/:id", async (req, res) => {
      const id = req.params.id;
      const rlst = await pets.collection("pet").deleteOne({
        _id: new ObjectId(id),
      });
      console.log(rlst);
    });

    // put
    app.patch("/pet/req/:status/:id", async (req, res) => {
      const id = req.params.id;
      const s = req.params.status;
      console.log(id, s);
      const rsl = await pets.collection("petreq").updateOne(
        {
          "pet._id": id,
        },
        {
          $set: {
            status: s,
          },
        },
      );
      console.log(rsl);
    });

    app.put("/addpet", async (req, res) => {
      console.log(req.body);

      const data = req.body;
      const id = data._id;
      delete data._id;
      const msg = await pets.collection("pet").updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: data,
        },
      );
      console.log(msg);
    });
  } finally {
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

const serverless = require("serverless-http");
module.exports.handler = serverless(app);