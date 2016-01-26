/*Define dependencies.*/

var express=require("express");
var multer  = require('multer');
var app=express();

var upload = multer({ dest: 'uploads/' });

app.get('/',function(req,res){
  res.sendfile("./example/index.html");
});
app.get('/bundle.js',function(req,res){
  res.sendfile("./example/bundle.js");
});

app.post('/api/upload', upload.single('file'), function(req,res){
  res.end("File uploaded.");
});

app.listen(3000,function(){
  console.log("Working on port 3000");
});