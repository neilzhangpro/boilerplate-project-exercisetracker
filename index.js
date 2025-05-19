const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// In-memory storage
const users = []
const exercises = []

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body
  const _id = Date.now().toString()
  const user = { username, _id }
  users.push(user)
  res.json(user)
})

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users)
})

// Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params
  const { description, duration, date } = req.body
  
  const user = users.find(u => u._id === _id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const exercise = {
    userId: _id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  }

  exercises.push(exercise)

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  })
})

// Get exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params
  const { from, to, limit } = req.query

  const user = users.find(u => u._id === _id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  let userExercises = exercises.filter(e => e.userId === _id)

  // Apply date filters if provided
  if (from || to) {
    userExercises = userExercises.filter(exercise => {
      const exerciseDate = exercise.date
      if (from && new Date(exerciseDate) < new Date(from)) return false
      if (to && new Date(exerciseDate) > new Date(to)) return false
      return true
    })
  }

  // Apply limit if provided
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit))
  }

  // Format exercises for response
  const formattedExercises = userExercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }))

  res.json({
    _id: user._id,
    username: user.username,
    count: formattedExercises.length,
    log: formattedExercises
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
