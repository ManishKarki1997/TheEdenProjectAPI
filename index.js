const express = require('express')
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();

const PORT = process.env.PORT || 3000

const cors = require('cors');
const bodyParser = require('body-parser');


app.use('/uploads/', express.static('uploads'))

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());
app.use(cors());



// Import Routes
const UserRoutes = require('./routes/UserController');
const ProjectRoutes = require('./routes/ProjectController');


app.use('/api/user', UserRoutes);
app.use('/api/project', ProjectRoutes);

app.listen(PORT, () => console.log('App running on ', PORT))

mongoose.connect('mongodb://localhost:27017/theedenproject', {
    useNewUrlParser: true
}).then(() => {
    console.log('Mongodb Connected')
}).catch(err => console.log('error ', err))