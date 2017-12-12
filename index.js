var express = require('express');
var mongoose = require ("mongoose"); // The reason for this demo.
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
   extended: false
}));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/test_db', function(request, response) {
    var http = require ('http');         // For serving a basic web page.
	// response.send("hii----");

    // Here we find an appropriate database to connect to, defaulting to
    // localhost if we don't find one.
    var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';

    console.log("uri"+uristring);
    mongoose.connect(uristring, function (err, res) {
      if (err) {
      response.send ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
      response.send ('Succeeded connected to: ' + uristring);
      }
    });
});

app.all('/login', function(request, response) {
 if(request.method==='POST'){
	response.redirect('pages/home')
 }else{
	response.render('pages/login')
 
 }
});

app.all('/home', function(request, response) {
 
	response.render('pages/home')
 
});
app.all('/collection_view', function(request, response) {
 
	response.render('pages/collection_view')
 
});

app.all('/brands', function(request, response) {
 
	response.render('pages/brand')
 
});

app.all('/upload', function(request, response) {
 
	response.render('pages/upload')
 
});
app.all('/dashboard', function(request, response) {
 
	response.render('pages/dashboard')
 
});
app.get('/cool', function(request, response) {
  response.send({"return":"cool"});	
});

app.all('/sheet', function(request, response) {
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
					response.render('pages/sheet',{title:'post',data:cells, row:5})	
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
		response.render('pages/sheet',{title:'get',data:""})	
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