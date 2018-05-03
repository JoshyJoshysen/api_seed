var express = require('express');
var router = express.Router();
var City = require('../models/city');
var Verify = require('./verify');

/**
 * @swagger
 * definition:
 *   City:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *       country:
 *         type: string
 *       zipcode:
 *         type: integer
 */

/**
 * @swagger
 * /city:
 *   get:
 *     tags:
 *       - City
 *     description: Returns all cities
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of cities
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/City'
 *       403:
 *         description: You are not authorized to perform this operation! or No token provided!
 *       401:
 *         description: You are not authenticated!
 */

router.get('/', function (req, res, next) {
  City.find({}, function (err, city) {
    if (err) throw err;
    res.json(city);
  });
});

/**
 * @swagger
 * /city/{cityId}:
 *   get:
 *     tags:
 *       - City
 *     description: Returns a specific city
 *     parameters:
 *       - name: cityId
 *         in: path
 *         description: The ID of a city
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns the city
 *         schema:
 *           $ref: '#/definitions/City'
 *       500:
 *         description: Error message
 */
router.get('/:cityId', function(req, res, next) {
  City.findById(req.params.cityId, function(err, city){
    if (err){
      throw err;
    } else {
      res.json(city);
    }
  });
});

/**
 * @swagger
 * /city:
 *   post:
 *     tags:
 *       - City
 *     description: Create a City
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: city
 *         description: City object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/City'
 */
router.post('/', Verify.verifyOrdinaryUser, function (req, res, next) {
  req.body.createdBy = req.decoded._doc._id;
  City.create(req.body, function (err, city) {
    if (err) throw err;
    res.status(200).json({
      status: 'city saved!',
      success: true,
      city: city
    });
  });
});

/**
 * @swagger
 * /city/{cityId}:
 *   delete:
 *     tags:
 *       - City
 *     description: Deletes a specific project
 *     parameters:
 *       - name: cityId
 *         in: path
 *         description: The ID of a city
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           $ref: '#/definitions/City'
 *       500:
 *         description: Error message
 */
router.delete('/:cityId', Verify.verifyOrdinaryUser, function (req, res, next) {
  var user = req.decoded._doc._id;
  /*
  City.remove({_id: req.params.cityId}, function (err, resp) {
      if (err) throw err;
      res.json(resp);
    }
  );
  */
  City.findById(req.params.cityId, function (err, city) {
    if (err) {
      throw err;
    } else {
      if (user == city.createdBy) {
        city.remove(function (err, c) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).json({
              status: 'city successfully deleted!',
              success: true,
              city: c
            });
          }
        })
      } else {
        res.status(500).json({
          status: 'User does not match the createdBy field',
          success: false
        });
      }
    }
  });
});

/**
 * @swagger
 * /city/{cityId}:
 *   put:
 *     tags:
 *       - City
 *     description: Updates a specific project
 *     parameters:
 *       - name: cityId
 *         in: path
 *         description: The ID of a city
 *         required: true
 *         type: string
 *       - name: City
 *         description: City object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/City'
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns the dataset
 *         schema:
 *           $ref: '#/definitions/City'
 *       500:
 *         description: Error message
 */
router.put('/:cityId', Verify.verifyOrdinaryUser, function (req, res, next) {
  req.body.createdBy = req.decoded._doc._id;
  City.findByIdAndUpdate(req.params.cityId,
    req.body
    , {
      new: true
    }, function (err, city) {
      if (err){
        res.status(500).send(err);
      } else {
        res.status(200).json({
          status: 'city successfully updated!',
          success: true,
          city: city
        });
      }
    });
});


module.exports = router;