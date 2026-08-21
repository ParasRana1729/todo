const express = require('express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const { userModel, todoModel } = require('./models')
const { authMiddleware } = require('./middleware')

const app = express()

app.use(express.json())

app.post('/signup', async (req, res) => {
  const username = req.body.username
  const password = req.body.password

  const userExists = await userModel.findOne({
    username
  })

  if (userExists) {
    res.status(409).json({
      message: "the user already existss"
    })
    return
  }

  const user = await userModel.create({
    username,
    password
  })

  res.json({
    id: user._id,
    message: "user has been created"
  })
})

app.post('/signin', async (req, res) => {
  const username = req.body.username
  const password = req.body.password

  const userExists = await userModel.findOne({
    username
  })

  if (!userExists) {
    res.status(404).json({
      message: "username does not exist"
    })
    return
  }

  if (password !== userExists.password) {
    res.status(401).json({
      message: "incorrect password"
    })
    return
  }

  const token = jwt.sign({ userId: userExists._id }, 'key')

  res.json({
    token,
    userId: userExists._id,
    message: "signed in"
  })
})

app.post('/todo', authMiddleware, async (req, res) => {
  const userId = req.userId
  const title = req.body.title
  const desc = req.body.desc

  if(!title) return res.status(400).json({message:"title required"});

  const todo = await todoModel.create({
    title,
    desc,
    userId
  })

  res.json({
    todoId: todo._id,
    message: "todo has been added"
  })
})

app.delete('/todo/:todoId', authMiddleware, async (req, res) => {
  const userId = req.userId
  const todoId = req.params.todoId

  const todo = await todoModel.findOneAndDelete({ _id: todoId, userId })

  if (!todo) {
    return res.status(404).json({
      message: "todo does not exist"
    })
  }

  res.json({ message: "todo deleted", todoId: todo._id });
})

app.get('/todos', authMiddleware, async (req, res) => {
  const userId = req.userId
  const todo = await todoModel.find({ userId: userId })

  res.json({
    todo
  })
})

async function start() {
  await mongoose.connect('mongodb+srv://parasrana1728_db_user:REDACTED@cluster0.vbx9loo.mongodb.net/todo');
  console.log("connected to db");
  app.listen(3000, () => console.log("the server is running at: http://localhost:3000"));
}
start();
