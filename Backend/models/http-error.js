class httpError extends Error{  //inherit all info from Error (in built)class
     constructor(message,errorCode){
    super(message);  //add message property
    this.code=errorCode; //add code property
    }
}

module.exports=httpError;