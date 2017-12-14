var express = require('express');
var expressSession = require('express-session');
var app = express();
var db = require('./config/database');
// var Admin        = require('./model/admins');
var mongoose = require('mongoose');
var mongo = require('mongodb');
// var Server = mongo.Server, Db = mongo.Db, BSON = mongo.BSONPure;
// var server = new Server('ds135926.mlab.com', 35926, {auto_reconnect: true});
// db = new Db('heroku_914rlv3g', server);
// db.open(function(err, db) {
    // if(!err) {
        // console.log("Connected to 'scedule_copy' database");
    // }
    // console.log("dbconnection error "+err);
// });
var Auth   = require('./middleware/auth');
	var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
   extended: false
}));
app.use(bodyParser.json());
app.use(expressSession({secret:'max',saveUninitialized:false,resave:false,
    maxAge: 7 * 24 * 3600 * 1000
}));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});
/* app.get('/create_admin', function(request, response) {
    var Obj = new Admin();
   Obj.email        = "admin@gmail.com";
   Obj.password       = "Singh!@#";
	Obj.save(function(error,success) {
	   if(error){
		   console.log("error "+error);
	   }else{
		   response.send("user created");
	   }
	});
}); */

app.get('/logout',function(request,response){

        request.session.destroy(function(err) {
            if(err) {
                console.log(err);
            } else {
                response.redirect('/login');
            }
        });
    });

app.all('/login', function(request, response) {
 if(request.method==='POST'){
	 // var schema = {
            // 'email': {
                // notEmpty: {errorMessage:'Email id is required'},
                // isEmail : {errorMessage:'Email id is invalid'}
            // },
            // 'password':{
                // notEmpty: {errorMessage:'Password field is required'}
            // }
        // };
        // request.check(schema);
        // var errors = request.validationErrors();
        // if(errors){
            // request.session.errors = errors;
            // console.log("validation error "+JSON.stringify(errors));
            // response.render('pages/login',{title:'Login',success:false,errors:request.session.errors});
        // }else{
			var email       = request.body.email;
			var password    = request.body.password;
			mongo.connect(uristring, function (err, db) {
      if (err) {
		   db.close();
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			respone.send(err);
      } else {
		  db.collection("admins", function(err, collection) {
            collection.findOne({email:email}, function (error, success) {
               if(error){
                    console.log("error : "+error);
               }
               console.log("success"+success);
               if(success!=null){
                   console.log("success1");
                   if(success.password===password){
                   // if(decrypt(success.password)===password){
                       request.session.email 		= request.body.email;
                       request.session._id 		    = success._id;
                       request.session.admin_name 	= request.body.name;
                       request.session.adminUser	= success;

                       response.redirect('collection_view');
                   }else{
                       request.session.errors = 'Invalid email id or password';
                       response.render('pages/login',{title:'Login',success:false,errors:request.session.errors});
                   }
               }else{
                   request.session.errors = 'Invalid email id or password';
                   response.render('pages/login',{title:'Login',success:false,errors:request.session.errors});
               }

            }	);
            }	);
	  }
			});
        // }

 }else{
	response.render('pages/login',{errors:"",title:"Login"})
 
 }
});

app.all('/home', Auth, function(request, response) {
 
	response.render('pages/home')
 
});
app.all('/collection_view', function(request, response) {
	mongo.connect(uristring, function (err, db) {
      if (err) {
		   db.close();
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			respone.send(err);
      } else {
		console.log ('Succeeded connected to-: ' + uristring);
		// db.collection("admins", function(err, collection) {
			db.listCollections().toArray(function(error, result) {
			// collection.find({}).toArray( function(error,result) {
			if (error){
				respone.send(err);
			} else{
				console.log("respone"+JSON.stringify(result));
				db.close();
				response.render('pages/collection_view',{url:"collection_view",data:result})
			}
   
  // });
		});
      }
    });
 
});

app.all('/brands', Auth, function(request, response) {
 
	response.render('pages/brand',{url:"brands"})
 
});

app.all('/upload', Auth,  function(request, response) {
 
	response.render('pages/upload',{url:"upload"})
 
});
app.all('/dashboard', function(request, response) {
 
	response.render('pages/dashboard')
 
});
app.get('/cool', function(request, response) {
  response.send({"return":"cool"});	
});

app.all('/sheet', Auth, function(request, response) {
	 if(request.method==='POST'){
		var log_id 		      = request.body.sheet_url;
		var GoogleSpreadsheet = require('google-spreadsheet');
		var async 			  = require('async');
		// spreadsheet key is the long id in the sheets URL
		// var doc = new GoogleSpreadsheet('1a_VZIN7bHNSzZ4YKRowKMznJE9ByKiJaTOSuBKclSog');
		var doc = new GoogleSpreadsheet(log_id);
		var sheet;

		async.series([
			function setAuth(step) {
				// see notes below for authentication instructions!
				var creds = require('./My Project 2325-1303b16fb420.json');
				// OR, if you cannot save the file locally (like on heroku)
				var creds_json = {
					client_email: 'tester-436@seraphic-vertex-188009.iam.gserviceaccount.com',
					private_key : '\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD2c3nH2weJXqA3\nQu0ByPrdvcCW+O7+rd6zpMAi8DZG3xAPgDwUt/ZnvLs1cCCyF+sxcyie1N7ZYH04\nqjgFYrTbgupmFlBGLmLnFLZSUztkRibTN4Gr9i3fcyHexZB1rJHDxzzk0MuMQw6+\nwmVxqXIhJrqpxflnjPEKG6FiE7tSyAGpY8G3GC/mrfcHbsZzgvlQ0zElA5uSkG2+\n6WnC8Oj852bEqDPb7i0wD7moK7q7qu8dH6WWgOXvRUeRCIh6Kb/Nobr4lchygRYa\nVo6rKd8aJgcOSgGHfxvnMp2zc0TagfQ47HFFJY9k0bdzevoKflY33kkWOC5Q1cPX\nbpPu6MQBAgMBAAECggEAE51dM+razrQZTEynUF0Omldf3KQzYVG1R9b089LqfvmB\n7bnnDj8V/Wun+rjR4VrF/UmNEhcfJW3oiXoCu2r/ufjRbw6XlP5cIMglOqglMfXj\nYSwpxeXyALbJG1HeDX+OmmZhElUL3j34DnaqXEGAM+NBOAHpt7Qf+w336jZn0k6w\n1w47Ak9EisvJ7tVgoDDuSCXlyw6TSkbyUfCaFHFNuS5W9mCo9+WZZ1psARzWSn1Y\nLtoY5LdMmaYZ0rkd7sW/YlUnsvusxavrHH6iH034vCY50OOVQfd7fbjwxk2VkKVy\nb9p4oaTgT+VwLXjKSbEH/lwH6ZzP4a4jZd4ML/FCAQKBgQD9uKl3OgDlm+wfHfeb\nICGWKTGfEoRJRF1/gz9wIYaj7gYPmnScIhBz2/Q1wCkSeWR8LyAG+gHJSeQb54lC\nRGyDTyPxn/xcqo+0C8D16DsXQaIHcLepTb3YuBw6qXVnNSqWFSTIzt2PJ1c6S/ID\nDUjxUmXM7hpxvFSzFbbrk3KU1QKBgQD4qhk1QnnmEWpyFwuc6tzAKDYWvLAW+awH\ntgYMOsVBZwY9zfM7bcO++ZzryCpXzRczgk3EXOE08Ws1cAcYRtWrm1LjpWQIxSkZ\nZg6Y3Nec8bIJeZOdDrmI0WwORC7BdngysH7/CHcFgLrgvd4t1iysYurT1KUfmVAh\nDQhws4m4fQKBgFKM4X5sPdx29cVOD8DGHIdp0b5K3QWlm7IgNuS507/Ecu5it6wR\nHT9FAlj2s6ZSHtKU1pvOfgRK6U/27l7EOnYiqrQz9H0F9YmEBX082PUBIsG+99K6\n+5jmljCz8AHrd3arXHOFcurfxu6txQkfKmtx/rNFiQ8WUoyN9R0CtVYdAoGBAO6N\ngJFvrLHik1PQd/uZ9R0DdqBpdCUWcMsU/MhOuV39ECfKpEWnD9rubHRmGvkQb+mi\nYCi5UfQQhuFFEAliKynuYJ6z1Dv1qXAMUISlmNOfq0UbtVk+/w8amac2EgTXOoim\nea8A1+4XiTCB9dvTVBgs7Us6/Q5LbmvGrQoxszWhAoGBAKQ6dbqOVKT1X3neKMg9\n0YyzqnmPh3g3vnopwxl3IAVhQgK6TsfbV99s/+ZtY9G/ZfDlW4mn2C74nU6i6WPe\n0xxJ12MGReS2ocodJmHrZNdjCM6h152D+rXOS8RcIoT2BvpukoHWVu3X25Oq7c4l\n9DKOtoNg9zV/5/s2sgWz5aPY\n'
				}
				doc.useServiceAccountAuth(creds, step);
			},
			function getInfoAndWorksheets(step) {
				doc.getInfo(function(err, info) {
					if(err){
						console.log('err doc: '+err);
						response.send(err);
					}else{
						// console.log('Loaded doc: '+JSON.stringify(info));
						console.log('Loaded doc: '+info.title+' by '+info.author.email);
						sheet = info.worksheets[0];
						console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
						step();
					}
				});
			},
			function workingWithRows(step) {
				// google provides some query options
				sheet.getRows({
					offset	: 1,
					limit	: 20,
					orderby : 'col2'
				}, function( err, rows ){
					console.log('Read '+rows.length+' rows');
					// the row is an object with keys set by the column headers
					rows[0].colname = 'new val';
					rows[0].save(); // this is async
					// deleting a row
					rows[0].del();  // this is async
					step();
				});
			},
			function workingWithCells(step) {
				sheet.getCells({
					'min-row'	  : 2,
					'max-row'	  : 20,
					'min-col'	  : 2,
					'max-col'	  : 24,
					'return-empty': true
				}, function(err, cells) {
					// console.log("cells"+JSON.stringify(cells));
					var cell = cells[0];
					// console.log('Cell R'+cell.row+'C'+cell.col+' = '+cell.value);
					// response.send(cells);
					response.render('pages/sheet',{url:"collection_view", title:'post',data:cells, row:5})	
					// cells have a value, numericValue, and formula
					cell.value == '1'
					cell.numericValue == 1;
					cell.formula == '=ROW()';
					// updating `value` is "smart" and generally handles things for you
					cell.value = 123;
					cell.value = '=A1+B2'
					cell.save(); //async
					// bulk updates make it easy to update many cells at once
					cells[0].value = 1;
					cells[1].value = 2;
					cells[2].formula = '=A1+B1';
					sheet.bulkUpdateCells(cells); //async
					step();
				});
			}/* ,
			function managingSheets(step) {
				doc.addWorksheet({
					title: 'my new sheet'
				}, function(err, sheet) {
					if(err){
						console.log(err+"errr");
						response.send(err);
					}else{
						// change a sheet's title
						sheet.setTitle('new title'); //async
						//resize a sheet
						sheet.resize({rowCount: 50, colCount: 20}); //async
						sheet.setHeaderRow(['name', 'age', 'phone']); //async
						// removing a worksheet
						sheet.del(); //async
						step();
					}
				});
			} */
		], function(err){
			if( err ) {
				console.log('Error: '+err);
			}
		});
	}else{
		response.render('pages/sheet',{url:"collection_view", title:'get',data:""})	
	}
});
app.post('/get_gsheet_data', function(request, response) {
	var GoogleSpreadsheet = require('google-spreadsheet');
	var async = require('async');
	// spreadsheet key is the long id in the sheets URL
	// var doc = new GoogleSpreadsheet('1a_VZIN7bHNSzZ4YKRowKMznJE9ByKiJaTOSuBKclSog');
	var doc = new GoogleSpreadsheet('1YbT1WeGClB1AxIigFLVT7MzGfNEBdJHvxEt6VU5AP7I');
	var sheet;
	async.series([
		function setAuth(step) {
			// see notes below for authentication instructions!
			var creds = require('./My Project 2325-1303b16fb420.json');
			// OR, if you cannot save the file locally (like on heroku)
			var creds_json = {
				client_email: 'tester-436@seraphic-vertex-188009.iam.gserviceaccount.com',
				private_key: '\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD2c3nH2weJXqA3\nQu0ByPrdvcCW+O7+rd6zpMAi8DZG3xAPgDwUt/ZnvLs1cCCyF+sxcyie1N7ZYH04\nqjgFYrTbgupmFlBGLmLnFLZSUztkRibTN4Gr9i3fcyHexZB1rJHDxzzk0MuMQw6+\nwmVxqXIhJrqpxflnjPEKG6FiE7tSyAGpY8G3GC/mrfcHbsZzgvlQ0zElA5uSkG2+\n6WnC8Oj852bEqDPb7i0wD7moK7q7qu8dH6WWgOXvRUeRCIh6Kb/Nobr4lchygRYa\nVo6rKd8aJgcOSgGHfxvnMp2zc0TagfQ47HFFJY9k0bdzevoKflY33kkWOC5Q1cPX\nbpPu6MQBAgMBAAECggEAE51dM+razrQZTEynUF0Omldf3KQzYVG1R9b089LqfvmB\n7bnnDj8V/Wun+rjR4VrF/UmNEhcfJW3oiXoCu2r/ufjRbw6XlP5cIMglOqglMfXj\nYSwpxeXyALbJG1HeDX+OmmZhElUL3j34DnaqXEGAM+NBOAHpt7Qf+w336jZn0k6w\n1w47Ak9EisvJ7tVgoDDuSCXlyw6TSkbyUfCaFHFNuS5W9mCo9+WZZ1psARzWSn1Y\nLtoY5LdMmaYZ0rkd7sW/YlUnsvusxavrHH6iH034vCY50OOVQfd7fbjwxk2VkKVy\nb9p4oaTgT+VwLXjKSbEH/lwH6ZzP4a4jZd4ML/FCAQKBgQD9uKl3OgDlm+wfHfeb\nICGWKTGfEoRJRF1/gz9wIYaj7gYPmnScIhBz2/Q1wCkSeWR8LyAG+gHJSeQb54lC\nRGyDTyPxn/xcqo+0C8D16DsXQaIHcLepTb3YuBw6qXVnNSqWFSTIzt2PJ1c6S/ID\nDUjxUmXM7hpxvFSzFbbrk3KU1QKBgQD4qhk1QnnmEWpyFwuc6tzAKDYWvLAW+awH\ntgYMOsVBZwY9zfM7bcO++ZzryCpXzRczgk3EXOE08Ws1cAcYRtWrm1LjpWQIxSkZ\nZg6Y3Nec8bIJeZOdDrmI0WwORC7BdngysH7/CHcFgLrgvd4t1iysYurT1KUfmVAh\nDQhws4m4fQKBgFKM4X5sPdx29cVOD8DGHIdp0b5K3QWlm7IgNuS507/Ecu5it6wR\nHT9FAlj2s6ZSHtKU1pvOfgRK6U/27l7EOnYiqrQz9H0F9YmEBX082PUBIsG+99K6\n+5jmljCz8AHrd3arXHOFcurfxu6txQkfKmtx/rNFiQ8WUoyN9R0CtVYdAoGBAO6N\ngJFvrLHik1PQd/uZ9R0DdqBpdCUWcMsU/MhOuV39ECfKpEWnD9rubHRmGvkQb+mi\nYCi5UfQQhuFFEAliKynuYJ6z1Dv1qXAMUISlmNOfq0UbtVk+/w8amac2EgTXOoim\nea8A1+4XiTCB9dvTVBgs7Us6/Q5LbmvGrQoxszWhAoGBAKQ6dbqOVKT1X3neKMg9\n0YyzqnmPh3g3vnopwxl3IAVhQgK6TsfbV99s/+ZtY9G/ZfDlW4mn2C74nU6i6WPe\n0xxJ12MGReS2ocodJmHrZNdjCM6h152D+rXOS8RcIoT2BvpukoHWVu3X25Oq7c4l\n9DKOtoNg9zV/5/s2sgWz5aPY\n'
			}
			doc.useServiceAccountAuth(creds, step);
		},
	function getInfoAndWorksheets(step) {
		doc.getInfo(function(err, info) {
			if(err){
				console.log('err doc: '+err);
				response.send(err);
			}else{
				console.log('Loaded doc: '+info.title+' by '+info.author.email);
				sheet = info.worksheets[0];
				console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
				step();
			}
		});
	},
	function workingWithRows(step) {
		// google provides some query options
		sheet.getRows({
			offset: 1,
			limit: 20,
			orderby: 'col2'
		}, function( err, rows ){
			console.log('Read '+rows.length+' rows');
			// the row is an object with keys set by the column headers
			rows[0].colname = 'new val';
			rows[0].save(); // this is async
			// deleting a row
			rows[0].del();  // this is async
			step();
		});
	},
	function workingWithCells(step) {
		sheet.getCells({
			'min-row': 1,
			'max-row': 5,
			'min-col': 1,
			'max-col': 5,
			'return-empty': true
		}, function(err, cells) {
		console.log("cells"+JSON.stringify(cells));
		var cell = cells[1];
		console.log('Cell R'+cell.row+'C'+cell.col+' = '+cell.value);
		response.send(cell);
		// cells have a value, numericValue, and formula
		cell.value == '1'
		cell.numericValue == 1;
		cell.formula == '=ROW()';
		// updating `value` is "smart" and generally handles things for you
      cell.value = 123;
      cell.value = '=A1+B2'
      cell.save(); //async

      // bulk updates make it easy to update many cells at once
      cells[0].value = 1;
      cells[1].value = 2;
      cells[2].formula = '=A1+B1';
      sheet.bulkUpdateCells(cells); //async

      step();
    });
  }/* ,
  function managingSheets(step) {
    doc.addWorksheet({
      title: 'my new sheet'
    }, function(err, sheet) {
if(err){
	
console.log(err+"errr");
response.send(err);
	
}else{
      // change a sheet's title
      sheet.setTitle('new title'); //async

      //resize a sheet
      sheet.resize({rowCount: 50, colCount: 20}); //async

      sheet.setHeaderRow(['name', 'age', 'phone']); //async

      // removing a worksheet
      sheet.del(); //async

      step();
	}
    });
  } */
], function(err){
    if( err ) {
      console.log('Error: '+err);
    }
});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});