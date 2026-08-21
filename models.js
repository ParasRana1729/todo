const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  password: String
})

const todoSchema = new mongoose.Schema({
  title: String,
  desc: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
})

const userModel = mongoose.model("users", userSchema)
const todoModel = mongoose.model("todos", todoSchema)

module.exports = {
  userModel,
  todoModel,
}
