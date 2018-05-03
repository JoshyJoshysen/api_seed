var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var City = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  country: String,
  zipcode: Number
},{
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('City', City);
