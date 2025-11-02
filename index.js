const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const app = express();
const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology:true,
        });
        console.log('MongoDB connected sucessfully!');     
    } catch (err) {
        console.error(err.message);

        process.exit(1);
    }
};
connectDB();
app.use(express.json());
app.use('/api/auth',authRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/users',userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`Server is running on PORT ${PORT}`);

});