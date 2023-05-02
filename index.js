require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./routes/index.js');
const ErrorsMiddlelawer = require('./middlelawer/api-midlelawer.js');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router);
app.use(ErrorsMiddlelawer);

const start = async () => {
    try{
        await mongoose.connect(process.env.URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => console.log(`success on port ${PORT}`));
    } catch(e){
        console.error(e);
    }
}
start();