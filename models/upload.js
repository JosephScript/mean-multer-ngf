var mongoose = require('mongoose');

var UploadSchema = mongoose.Schema({
  name: String,
  created: Date,
  file: Object
});

module.exports = mongoose.model('Upload', UploadSchema);