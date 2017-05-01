var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var d3 = require("d3");
var PythonShell = require('python-shell');
var pyshell = new PythonShell('python/echo_binary.py');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');


  // store result
    form.resultPath = path.join(__dirname, '/');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    console.log(file.name);
    form.resultPath = file.path;
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function(field, file) {
    //TODO process file here
    res.end('success!!' + this.openedFiles[0].path);


      var options = {
          mode: 'text',
          pythonOptions: ['-u'],
          scriptPath: 'python/',
          args: [form.resultPath, 'value2', 'value3']
      };

      PythonShell.run('echo_args.py', options, function (err, results) {
          if (err) throw err;
          // results is an array consisting of messages collected during execution
          console.log('results: %j', results);
      });

  });





  // parse the incoming request containing the form data
  form.parse(req);

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
