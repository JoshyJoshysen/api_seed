var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify    = require('./verify');

/**
 * @swagger
 * definition:
 *   LoginUser:
 *     type: object
 *     required:
 *       - username
 *       - password
 *     properties:
 *       username:
 *         type: string
 *       password:
 *         type: string
 *   NewUser:
 *     type: object
 *     properties:
 *       firstname:
 *         type: string
 *       lastname:
 *         type: string
 *     allOf:
 *       - $ref: '#/definitions/LoginUser'
 *   User:
 *     properties:
 *       _id:
 *         type: string
 *       admin:
 *         type: boolean
 *       __v:
 *         type: integer
 *       username:
 *         type: string
 *       firstname:
 *         type: string
 *       lastname:
 *         type: string
 */


/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns all users (needs to have admin rights)
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of users
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 *       403:
 *         description: You are not authorized to perform this operation! or No token provided!
 *       401:
 *         description: You are not authenticated!
 */
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin,  function(req, res, next) {
  User.find({}, function (err, user) {
    if (err) throw err;
    res.json(user);
  });
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags:
 *       - Users
 *     description: Registers a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/NewUser'
 *     responses:
 *       200:
 *         description: Registration Successful!
 *       500:
 *         description: Registration error
 *         schema:
 *           type: object
 *           properties:
 *             err:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 message:
 *                   type: string
 */

router.post('/register', function(req, res) {
  console.log(req.body);
  User.register(new User({ username : req.body.username }),
    req.body.password, function(err, user) {
      if (err) {
        return res.status(500).json({err: err});
      }
      if(req.body.firstname) {
        user.firstname = req.body.firstname;
      }
      if(req.body.lastname) {
        user.lastname = req.body.lastname;
      }
      user.save(function(err,user) {
        passport.authenticate('local')(req, res, function () {
          return res.status(200).json({status: 'Registration Successful!'});
        });
      });
    });
});

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     tags:
 *       - Users
 *     description: Delets a specific user (can only be performed by an admin user)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: The ID of a user
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success message
 *       500:
 *         description: Error message
 */
router.delete('/:userId', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res) {
  User.remove({_id: req.params.userId}, function (err, resp) {
    if (err) throw err;
    res.json(resp);
    }
  );
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     description: Logs a user in
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/LoginUser'
 *     responses:
 *       200:
 *         description: Login successful!
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             success:
 *               type: boolean
 *             token:
 *               type: string
 *       500:
 *         description: Could not log in user
 *       401:
 *         description: Password or username are incorrect
 *
 */
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      
      var token = Verify.getToken(user);
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});

/**
 * @swagger
 * /users/logout:
 *   get:
 *     tags:
 *       - Users
 *     description: Logs a user out
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Logout successful!
 *       500:
 *         description: Could not log in user
 *       401:
 *         description: Password or username are incorrect
 *
 */
router.get('/logout', function(req, res) {
  req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

router.get('/facebook', passport.authenticate('facebook'), function(req, res){
  
});

router.get('/facebook/callback', function(req,res,next){
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken(user);
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});

module.exports = router;