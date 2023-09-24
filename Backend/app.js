const express=require('express')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const fs=require('fs')
const path=require('path')

const httpError=require('./models/http-error')

const placesRoutes=require('./routes/places-routes');
const userRoutes=require('./routes/users-routes');


const app=express();



//Middleware

app.use(bodyParser.json())

app.use('/uploads/images',express.static(path.join('uploads','images')))


// The aim of this logic is to specify the rules and permissions for allowing cross-origin requests to your server.
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization')

  res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
  next()
})


app.use('/api/places',placesRoutes)
app.use('/api/users',userRoutes)

app.use((req,res,next)=>{
    const error=httpError('Could not find this routes',404);
    throw error;
})

app.use((error,req,res,next)=>{
  if(req.file){
    fs.unlink(req.file.path,(err)=>{
      console.log(err)

    })

  }


    if(res.headerSent){
        return next(error)
    }
    res.status(error.code ||500)
    res.json({'message':error.message} || 'error is occured')
})





mongoose
.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qq1ahu3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
   app.listen(5000)
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


