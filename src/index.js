const mongoose = require('mongoose');
const Models = require('./models.js');

const express = require('express'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'); //generates unique identifiers with Node

const Movies = Models.Movie;
const Users = Models.User;

const app = express(); //APP DEFINITION
const cors = require('cors');

const { check, validationResult } = require('express-validator');

app.use(cors()); //THIS CURRENTLY ALLOWS ALL ORIGINS

let auth = require('./auth')(app); //'app' PORTION ENSURES EXPRESS IS AVAILABLE IN AUTH.JS, MUST BE AFTER bodyParser lines

const passport = require('passport'); //MUST BE AFTER ./auth LINE
require('./passport');  //MUST BE AFTER ./auth LINE

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//mongodb+srv://user-matt:LOT2272dm@myflixdb.7b6ot.mongodb.net/myFlixDB?retryWrites=true&w=majority

//MAIN PAGE
app.get('/', (req, res) => {
  res.send("Welcome to the main page");
});

//GET LIST OF MOVIES WITH DATA
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET MOVIE BY TITLE
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title })
    .then((title) => {
      res.json(title);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET BY GENRE -- POSTMAN IS CASE SENSITIVE -- Thriller, Drama, Documentary, Biography, Action
app.get('/genres/:name', (req, res) => {
  Genres.findOne({ Name: req.params.name })
    .then((name) => {
      res.json(name);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET BY DIRECTOR NAME
app.get('/directors/:name', (req, res) => {
  Directors.findOne({ Name: req.params.name })
    .then((name) => {
      res.json(name);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET ALL USERS
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error: ' + err);
    })
})

//GET A USER BY USERNAME
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//ADD/REGISTER A USER
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is not required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail()
  ], (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword, //req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });


//UPDATE A USERS INFO
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//ADD A FAVORITE MOVIE TO USERS FAVORITES
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }, //MAKES SURE UPDATED DOCUMENT IS RETURNED
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//DELETE A USER BY USERNAME
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

//app.listen(8080, () => {
//  console.log('App listening on port 8080.');
//});




