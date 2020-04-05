var express = require('express');
var path = require('path');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require('redis');

var app = express();

// create redis client
var client = redis.createClient();
client.on('connect', function(){
    console.log('Redis Server connected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

// middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

//set up routes 
app.get('/', function(req, res){
    var title = 'Task List';
    client.LRANGE('tasks', 0, -1, function(err, reply){
        client.HGETALL('call', function(err, call){
            res.render('index', {
                title: title,
                tasks: reply,
                call: call
            });
        });
        
    });
    
});

app.post('/task/add', function(req, res){
    var task = req.body.task;
    client.RPUSH('tasks', task, function(err, reply){
        if(err) {
            console.log(err);
        }
        console.log('Tasks Added');
        res.redirect('/');
    });
});

app.post('/task/delete', function(req, res){
    var tasksToDel = req.body.tasks;
    client.LRANGE('tasks', 0, -1, function(err, tasks){        
        for (var i = 0; i < tasks.length; i++){
            if (tasksToDel.indexOf(tasks[i]) > -1) {
                client.LREM('tasks', 0, tasks[i], function(err, result){
                    if(err) {
                        console.log(err);
                    }
                });
            }
        }
        res.redirect('/');
    });
});

app.post('/call/add', function(req, res){
    var newCall = {};
    newCall.name = req.body.name;
    newCall.company = req.body.company;
    newCall.phone = req.body.phone;
    newCall.time = req.body.time;

    client.HMSET('call', ['name', newCall.name, 'company', newCall.company, 'phone', newCall.phone, 'time', newCall.time], function(err, reply){
        if(err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

app.listen(3000);
console.log('server started on port 3000');
module.exports = app;

