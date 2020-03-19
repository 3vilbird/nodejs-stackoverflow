const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const PersonSchema = new Schema({
 name:{
        type:String,
        required:true
      },
email:{
        type:String,
        required:true
      },
password:{
    type:String,
    required:true
    },
username:{
    type:String
},
profilepic:{
    type:String,
    default:'https://img.freepik.com/free-vector/businessman-profile-cartoon_18591-58479.jpg?size=338&ext=jpg'
},
date:{
    type:Date,
    default:Date.now
}
});

module.exports = Porson =mongoose.model("anything here",PersonSchema);
