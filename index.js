const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config({ quiet: true });
const port = process.env.PORT || 1000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.63qrdth.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect()

    const jobCollection = client.db("jobPortal").collection("jobs");
    const jobApplicationCollection = client
      .db("jobPortal")
      .collection("job_applications");

      // Auth related apis star
      
      // Auth related apis end

    // jobs related api
    app.get("/jobs", async (req, res) => {
      // extra start
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { hr_email: email };
      }
      // extra end
      // console.log(email);
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.get("/job-application", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const result = await jobApplicationCollection.find(query).toArray();
      for (const application of result) {
        // console.log(application.job_id);
        const query1 = { _id: new ObjectId(application.job_id) };
        const job = await jobCollection.findOne(query1);
        if (job) {
          application.title = job.title;
          application.location = job.location;
          application.jobType = job.jobType;
          application.company = job.company;
          application.company_logo = job.company_logo;
        }
      }
      res.send(result);
    });

    // add job
    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });

    // get
    app.get("/job-applications/jobs/:job_id", async (req, res) => {
      const jobId = req.params.job_id;
      const query = { job_id: jobId };
      const result = await jobApplicationCollection.find(query).toArray();
      res.send(result);
    });

    // job application api
    app.post("/job-applications", async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);
      // not the best way start
      // find a data from job collection and set applicationCount data
      const id = application.job_id;
      const query = { _id: new ObjectId(id) };
      const job = await jobCollection.findOne(query);
      let newCount = 0;
      if (job.applicationCount) {
        newCount = job.applicationCount + 1;
      } else {
        newCount = 1;
      }
      // not the best way end
      // now update the job info applicationCount
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          applicationCount: newCount,
        },
      };
      const updateResult = await jobCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch(`/job-applications/:id`, async (req, res) => {
      const id = req.params.id;
      const data = req.body;
    const filter= {
        _id: new ObjectId(id)
      }
      const updateDoc = {
        $set:{status: data.status},
      };
      const result = await jobApplicationCollection.updateOne(filter, updateDoc);
      res.send(result)
    });

    app.delete("/deleteApplication/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobApplicationCollection.deleteOne(query);
      res.send(result);
    });
    // await client.db("admin").command({ ping: 1 })
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job are falling are the sky");
});

app.listen(port, () => {
  console.log(`job is waiting: ${port}`);
});
