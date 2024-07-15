const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config();
const cors = require("cors");

const authRoutes = require("./routes/auth");


app.use(cors())
app.use(express.json())
app.use(express.static('public'))
// Routes
app.use("/auth", authRoutes)

// SetUp Mongoos 

const PORT = 3030;
mongoose .connect(process.env.Mongoo_Url, {
    dbName:"Rental-Application",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(()=>{
    app.listen(PORT, () => console.log(`server Port: ${PORT}`));
  })
  .catch((err)=> console.log(`${err} did not connect`));


