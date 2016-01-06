# Angular File Uploads

Surprisingly, uploading files can be a difficult task for someone new to the MEAN stack. Documentation is sparse or esoteric, and few simple examples exist. Some of them only deal with forms using a full post back and aren't fully Angular. 

This is an attempt to help!

There are a few frameworks we're going to be using to accomplish this task. 

[ngFileUpload](https://github.com/danialfarid/ng-file-upload) will be used for the file upload form in Angular.

[Multer](https://github.com/expressjs/multer) will be used by Express to save the files into a folder on the disk. You can adapt Multer to handle single or multiple files. We will just be using one for this tutorial.

## Project Set Up

To create a new Node application, run `npm init`. Enter what ever information you like during the prompts. I set my `main` to be `app.js`. This is my main point of entry to the applicaiton. If you're using a different file, be sure to name it in this step.


Then, since we're using Express for routing, Morgan for logging, Body Parser to handle request data and multer to handle files, we use NPM to install those:

```javascript
npm install express morgan body-parser multer --save
```

I chose to use Mongoose in order to interact with MongoDB. You could replace this with any other ORM or database driver. Just know that my files that use Mongoose would need to change to match your choice of technology and database

```javascript
npm install mongoose --save
```

Next, I'm going to be using Gulp to move my files into the static folder, simply out of convenience. You may skip this step if you're using a CDN or manually downloading or moving script files.

```javascript
npm install gulp --save
```

Install Angular and ngFileUpload how ever you prefer (CDN, manual download, or package manager). I used NPM to install them. I also used Angular Messages to display messages inline dynamically. 

```javascript
npm install angular angular-messages ng-file-upload --save
```

Check your `package.json` file to see if the dependencies are correct. Note that we may have different package versions and if that is the case you should reference the package page on http://npmjs.com/ to see if anything has changed.

```json
"dependencies": {
    "angular": "^1.4.8",
    "angular-messages": "^1.4.8",
    "body-parser": "^1.14.2",
    "express": "^4.13.3",
    "gulp": "^3.9.0",
    "mongoose": "^4.3.1",
    "morgan": "^1.6.1",
    "multer": "^1.1.0",
    "ng-file-upload": "^10.1.9"
  }
```

##Gulp tasks

My gulpfile simply copies the vendor scripts into a folder I defined. In this case, I'm going to have all of the vendor scripts go into `public/vendor`. You can skip this if you're using a CDN or just moving files manually.

```javascript
var gulp = require('gulp');

var paths = {
  vendor: ['node_modules/angular/angular.min.js',
    'node_modules/ng-file-upload/dist/ng-file-upload-all.min.js'],
  dest: 'public/vendor/'
};

gulp.task('copy-vendor', [], function () {
  // move vendor scripts
  return gulp.src(paths.vendor)
    .pipe(gulp.dest(paths.dest));
});

gulp.task('default', ['copy-vendor'], function () {
});
```

You can run the task by running `gulp` or `gulp default` from the command line. This will run the 'default' task, which has an array of all tasks it will subsequently run. In this case it's only running 'copy-vendor', but if you have any other tasks you want to run, just add them to default's array.

##Front End

Because this is a single page application I'm only using one HTML file. It's possible to use other files in tandem through Angular routing but that's not in the scope of this example.
 
Create a file `public/views/index.html`. This will be served by an Express router in a later step.

We're going to be using javascript and html for this application. I'm going to create a file `public/javascripts/fileuploadExample.js`. Public will be served by Express's static method later. This will contain all of the client side code.

`index.html` is a simple HTML5 file that contains a form, and some Angular code. You can use a basic HTML5 template and just add in what is needed.

In the head tag add in our scripts.

```html
<script src="/vendor/angular.min.js"></script>
<script src="/vendor/ng-file-upload-all.min.js"></script>
<script src="/javascripts/fileuploadExample.js"></script>
```

In the body tag we're declaring our application name. 

```html
<body ng-app="fileUpload">

</body>
```

This should match the application name in your JavaScript. Here you can also inject the ngFileUpload library.

```javascript
var app = angular.module('fileUpload', ['ngFileUpload']);
```

For now, let's just add some test information to the page using a controller, and then we can go get our server side code setup to serve these front end files that we have created.

```javascript
app.controller('formCtrl', ['$scope', function($scope){
  $scope.test = "Delete me";
}]);
```

Let's add the controller to our markup, and an area to display the test message:

```html
<body ng-app="fileUpload">
  <div ng-controller="formCtrl">
    <p>{{test}}</p>
  </div>
</body>
```

##Server side setup

Now that our basic architecture is set up, we can start serving our files via an Express server. Let's go create and set up a basic `app.js` file in the root of the project.

This will import our dependencies, set up logging, body parsing, and our basic static file server. The final app.listen actually 'turns on' our server. 

```javascript
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set up routes
app.use(express.static('public'));

var server = app.listen(3000, function(){
  var port = server.address().port;
  console.log('Listening on port: ', port);
});

module.exports = app;
```

You should be able to run this application using `node app.js`. Then navigating to `http://localhost:3000/views/index.html`. It should display your test message, because your javascript files are all included and being served by express.

##index.js

Serving the website from that URL is no fun, so we're going to create a route. Because we like to abstract our code we're going to use a router module. Create a new file named `routes/index.js`.


```javascript
var express = require('express');
var router = express.Router();
var path = require('path');

// middleware that is specific to this router
router.get('/', function(req, res, next) {
  var index = path.join(__dirname, '../public/views/index.html');
  res.sendFile(index);
});

module.exports = router;
```

This file creates a new express router object that has a get method on the path '/'. When this path is requested, we send the file at `/public/views/index.html`. 

This isn't actually being used yet, but is exported with `module.exports` so we can use it in our `app.js`, where our server lives.

Back in `app.js` add `var index = require('./routes/index');` at the top with the other requires to add the module. Right after the existing `app.use(express.static('public'));` add `app.use('/', index);` to use it. 

Rerun the application. Now when you navigate to `http://localhost:3000/` you should see the page!

##Upload Form

We're going to build an upload form that has a name field and a file picker. You can easily adapt the file picker to restrict to certain file types and sizes, or add any other fields you want. We're going to use an ng-submit to trigger a form submission in Angular, and ngf-select to tell our file upload to use ngFileUpload. Change the body of `public/views/index.html` to the following:

```html
<div ng-controller="formCtrl">
  <h1>This is a MEAN stack file upload example!</h1>
  <form ng-submit="submit()">
    <legend>Upload a new file here:</legend>
    <label for="name">Name:</label>
    <input type="text" name="name" id="name" ng-model="upload.name" required/>
    <br/>
    <label for="file">File:</label>
    <input type="file" name="file" id="file" ng-model="upload.file" ngf-select ngf-max-size="25MB" required/>
    <br/>
    <input type="submit" value="Submit"/>
  </form>
</div>
```

Notice the the name of the file input is `file`. This must match in Multer later. I'll be sure to call this out again.

Here we created a form with a model called `upload` with two fields, `name` and `file`. The submit action triggers the `submit()` function which we will define later. For now let's wire it up in our controller to just do a console log of our model.

Change the controller in `/javascripts/fileuploadExample.js` to the following:

```javascript
app.controller('formCtrl', ['$scope', function($scope){
  $scope.submit = function(){
    console.log($scope.upload);
  };
}]);
```

Refresh your page and see if the form is logging in your browsers console.

##Upload Model and API

The next step is to allow files to be uploaded to the server, and the data captured in the form to be saved. In order to save the data about the upload we will create a new model using Mongoose.

Add the following javascript in `/models/uploads`:

```javascript
var mongoose = require('mongoose');

var UploadSchema = mongoose.Schema({
  name: String,
  created: Date,
  file: Object
});

module.exports = mongoose.model('Upload', UploadSchema);
```

This creates a really basic Schema that has the name the user typed in, the date we created, and then an objec to store all of the data about the file in.
 
Let's create a new route for uploading files and saving form data. Create a file `routes/uploads.js`. 

```javascript
var express = require('express');
var router = express.Router();
var fs = require('fs');
var Upload = require('../models/upload');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
/**
 * Create's the file in the database
 */
router.post('/', upload.single('file'), function (req, res, next) {
  console.log(req.body);
  console.log(req.file);
  var newUpload = {
    name: req.body.name,
    created: Date.now(),
    file: req.file
  };
  Upload.create(newUpload, function (err, next) {
    if (err) {
      next(err);
    } else {
      res.send(newUpload);
    }
  });
});
module.exports = router;
```

NOTE that upload.single('file') is the name of the input field we mentioned earlier in our form.
 
Here you can see we have created a new post route, on the '/' url (We will have to provide a base url later when we use this module in our `app.js`) that injects Multer as middleware. Multer handles the entire file upload for us, and create a random name for the file so that two files with the same name don't collide.

We also create a new Upload object and store it to the database using the field the user filled out, the current timestamp, and the entire `req.file` object. This object is not normally available, but is now thanks to Multer. It store all metadata about the file, including the upload destination, the original file name, and more. We've console logged both so we can see them.

Now, we have to use the file in our `app.js`.

Right under `var index = require('./routes/index');` add `var uploads = require('./routes/uploads');`, and under `app.use('/', index);` add `app.use('/uploads', uploads);`. This tells express to use our route on the base url '/uploads'. 

Finally, we have to 'turn on' our mongo DB connection. Put the following code after `var app = express():`:

``` javascript
var mongoURI = "mongodb://localhost:27017/mean-multer-ngf"; // replace with your mongodb url

var MongoDB = mongoose.connect(mongoURI).connection;
MongoDB.on('error', function (err) {
  if (err) {
    console.log('mongodb connection error', err);
  } else {
    console.log('mongodb connection successful');
  }
});

MongoDB.once('open', function () {
  console.log('mongodb connection open');
});

```

Rerun the application, and we shouldn't have any troubles connection. If you're not running Mongo, you'll need to do that.

Finally, we have to hook up our upload form to this new API route that we've created.

Change the controller in `/javascripts/fileuploadExample.js` to the following:

```javascript
app.controller('formCtrl', ['$scope', function($scope){
  $scope.submit = function(){
      Upload.upload({
        url: '/uploads',
        method: 'post',
        data: $scope.upload
      }).then(function (response) {
        console.log(response.data);
        $scope.uploads.push(response.data);
        $scope.upload = {};
      })
    }
}]);
```

Now when we refresh the page, you should be able to upload files and have them appear in the `/uploads` folder! Check in Mongo and see that the data is also saving.

##Get files

Next we're going to wire up an API to send a list of all files. This can be adapted to display only particular files (such as those uploaded by a user or on a certain date).

Since we already have our front end javascript file open, add this to the controller:

```javascript
$http.get('/uploads').then(function(response){
    console.log(response.data);
    $scope.uploads = response.data;
  });
```

We don't yet have a get function in our uploads router, so this will fail on page load. 

Let's set up the HTML for the `$scope.uploads` data we plan on returning. 

In index.html add the following inside the `<div ng-controller...>` tag:

```
<h2>All uploads are here:</h2>
<ul>
  <li ng-repeat="upload in uploads">
    <p>{{upload.name}}</p>
    <a ng-href='{{upload.file.path + "/" + upload.file.originalname}}'>{{upload.file.originalname}}</a>
  </li>
</ul>
```

You can see this matches the data in our database. We have an ng-repeat that iterates over every element in the array $scope.uploads, and displays the name, the URL, and the original name of the file.

In the `routes/uploads.js` router add the following code to retrieve all files form the database:

```javascript
/**
 * Gets the list of all files from the database
 */
router.get('/', function (req, res, next) {
  Upload.find({},  function (err, uploads) {
    if (err) next(err);
    else {
      res.send(uploads);
    }
  });
});
```

Finally, in order to allow a user to click and download a single file, we have to add a second router method. Add the following as well:

```javascript
/**
 * Gets a file from the hard drive based on the unique ID and the filename
 */
router.get('/:uuid/:filename', function (req, res, next) {
  console.log(req.params);
  Upload.findOne({
    'file.filename': req.params.uuid,
    'file.originalname': req.params.filename
  }, function (err, upload) {
    if (err) next(err);
    else {
      res.set({
        "Content-Disposition": 'attachment; filename="' + upload.file.originalname + '"',
        "Content-Type": upload.file.mimetype
      });
      fs.createReadStream(upload.file.path).pipe(res);
    }
  });
});
```

Here you can see we're actually requiring the route `/:uuid/:filename`, which is the route to include the UUID of the file (the pseudo-random name Multer generated) and the filename. This should match the URL we created in the `ng-href` in `index.html`. So when a user clicks a link, the should go to this router, match the file in the database, and then grab it from the hard drive using `fs`, a build in library for interacting with the filesystem.

From the database we can get the original filename (which we also already have from the params), and also the mimetype of the file so that the browser knows how to handle it. We're setting the content tuype and disposition to match these.

Finally using fs we pipe the read stream into the response which initiates download of the file.

## Error Handling

If you check the files you will also see a few extras. I've included some common error handlers that should prevent you from crashing your application when something bad happens. These are a ncie to have.

## Production

In production you most likely would not be saving files directly to disk. Instead, you would use Multer to save the files to some other file server. For example, you can use [multer-s3](https://www.npmjs.com/package/multer-s3) to store your files on an inexpensive Amazon S3 Bucket, and then download them using the [aws-sdk](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html). The easiest way is to use the [getObject](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property) method, and to pipe the data into the response in express. 