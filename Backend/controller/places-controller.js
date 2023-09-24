const { v4: uuidv4 } = require('uuid');
const {validationResult}=require('express-validator')
const fs=require('fs')

const httpError=require('../models/http-error')
const getCoordsForAddress=require( '../utils/location')
const Place=require('../models/place')
const User=require('../models/user')
const mongoose=require('mongoose')






const getPlaceById =async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  let place;
try{
   place = await Place.findById(placeId)

}
catch(err){
  const error=new httpError(
    'Something went wrong, could not find place try again',500
  )
  return next(error)
}
  

  if (!place) {
    const error= new httpError('Could not find a place for the provided id.', 404);
    return next(error)

  }
 

  res.json({ place:place.toObject({getters:true}) }); // => { place } => { place: place }
};

// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

const getPlacesByUserId = async(req, res, next) => {
  const userId = req.params.uid;
  // let places
  let userWithPlaces
  try{
    userWithPlaces = await User.findById(userId).populate('places')
  }catch(err){
    const error=new httpError(
      'Fetching places failed please try again',500
    )
    return next(error)
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new httpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ places:userWithPlaces.places.map(place=>place.toObject({getters:true})) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new httpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
    console.log('Coordinates:', coordinates); // Log coordinates
  } catch (error) {
    console.error('Error in getCoordsForAddress:', error); // Log errors
    return next(error);
  }


  // const title = req.body.title;
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creatorId:req.userData.userId
  });

  let user
  try{
   user=await User.findById(req.userData.userId)
  }catch(err){
    const error=new httpError(
      'Creating Place Failed ,Please try again',500
    )
    return next(error)
  }

  if(!user){
    const error=new httpError(
      'Could not find user for provided id',404
    )
    return next(error)
  }
  console.log(user)

  try {
    const sess=await mongoose.startSession()
    sess.startTransaction()
    await createdPlace.save({session:sess})
    user.places.push(createdPlace)
    await user.save({session:sess})
    sess.commitTransaction()



  } catch (err) {
    const error = new httpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }
  
  res.status(201).json({ place: createdPlace });
};
const updatePlace =async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(httpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place ;
  try{
    place=await Place.findById(placeId)

  }catch(err){
    const error=new httpError(
      'Something went wrong could not upadte the place',500

    )
    return next(error)

  }
  if(place.creatorId.toString()!==req.userData.userId){
    const error=new httpError(
      'You are not allow to edit the places',401
    )
    return next(error)
  }

  
  
  place.title = title;
  place.description = description;

  try{
    place.save()
  }catch(err){
    const error=new httpError(
      'Something went wrong,could not save the places',500
    )
    return next(error)
  }
  
  


  res.status(200).json({ place: place.toObject({getters:true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creatorId');
  } catch (err) {
    const error = new httpError(
      'Something w, could not delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new httpError('Could not find place for this id.', 404);
    return next(error);
  }

  // console.log('Place:', place);
  // console.log('Creator:', place.creatorId);

  if(place.creatorId.id!==req.userData.userId){
       
    const error=new httpError(
      'You are not allow to delete the places',401
    )
    return next(error)
  }

  const imagePath=place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({session: sess});
    place.creatorId.places.pull(place);
    await place.creatorId.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) 
  {

    const error = new httpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

   fs.unlink(imagePath,(err)=>{
    console.log(err)
   })
  res.status(200).json({ message: 'Deleted place.' });
};



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;


