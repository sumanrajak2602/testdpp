const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function connect() {
    try {
        const mongoURI = process.env.MONGO_URI;
        const db = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
      
        console.log('Connected Database Successfully');
        return Promise.resolve(db);
    } catch (error) {
        return Promise.reject(error);
    }
}

module.exports = connect;
