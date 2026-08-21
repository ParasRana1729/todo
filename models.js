const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  password: String
})

const todoSchema = new mongoose.Schema({
  title: String,
  desc: String,
  userId: mongoose.Types.ObjectId
})

const userModel = mongoose.Model("users", userSchema)
const todoModel = mongoose.Model("todos", todoSchema)

module.exports = {
  userModel,
  todoModel
}
