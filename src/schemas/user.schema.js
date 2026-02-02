import mongoose from "mongoose";
const user_schema = mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    unique: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: false,
  },
},{timestamp:true});
export const user_model = mongoose.model('coffee_users_collection', user_schema);
export default user_model; 