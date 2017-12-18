var express = require('express');
var expressSession = require('express-session');
var app = express();
var db = require('./config/database');
// var Admin        = require('./model/admins');
var mongoose = require('mongoose');
var mongo = require('mongodb');
var crypto           = require("crypto");
var algorithm        = "aes-256-ctr";
var password         = "d6F3Efeq";
var Auth   = require('./middleware/auth');
var login                = require("./controllers/login.js");
var brand                = require("./controllers/brand.js");
var collection                = require("./controllers/collection.js");
var cloudinary                = require("./API-Clients/cloudinary.js");
var googleSheet                = require("./API-Clients/googleSheet.js");
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


/* for encryption   */
function encrypt(text){
    var cipher  = crypto.createCipher(algorithm,password);
    var crypted = cipher.update(text,"utf8","hex");
    crypted    += cipher.final("hex");
    return crypted;
}
/* for decryption */
function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password);
    var dec      = decipher.update(text,"hex","utf8");
    dec         += decipher.final("utf8");
    return dec;
}
app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/logout',function(request,response){
   request.session.destroy(function(err) {
		if(err) {
			console.log(err);
		} else {
			response.redirect('/login');
		}
	});
});

app.post('/create_collection',function(request,response){
	collection.createCollection( request.body,function (err, result) {
		if(err){
			response.send({"error":err});  
        }
		// console.log("res"+JSON.stringify(result));
        if(result == null) {
			// response.redirect('/sheet/'+result._id);  
			response.redirect('/collection_view/'+result);  
        }else{
			response.redirect('/collection_view/'+result);  
			// response.redirect('/sheet/'+result._id);  
        }
    });
});
app.post('/create_brand',function(request,response){
	brand.createBrand( request.body,function (err, result) {
		if(err){
			response.send({"error":err});   
        }
        if(result == null) {
			response.redirect('/brands');  
        }else{
			response.redirect('/brands');  
        }
    });
});

app.post('/save_record',function(request,response){
	
	collection.saveSheetData( request.body,function (err, result) {
		if(err){
			response.redirect('/collection_view/'+request.body.brand_id);  
        }
        if(result == null) {
			response.redirect('/collection_view/'+request.body.brand_id);  	
        }else{
			response.redirect('/collection_view/'+request.body.brand_id);    
        }
    });
	
});

app.get('/delete_collection/:col_name',function(request,response){
	collection.deleteCollection( request.params,function (err, result) {
		if(err){
			response.redirect('/collection_view');  
        }
        if(result == null) {
			response.redirect('/collection_view');  	
        }else{
			response.redirect('/collection_view');    
        }
    });
});

app.all('/login', function(request, response) {
 if(request.method==='POST'){
	login.login( request.body,function (err, result) {
     
        if(err){
         request.session.errors = 'Some error occur .Please try again';
		 response.render('pages/login',{title:'Login',success:false,errors:request.session.errors});
        }
        if(result == null) {
            request.session.errors = 'Invalid email id or password';
			response.render('pages/login',{title:'Login',success:false,errors:request.session.errors});
        }else{
			request.session.email 		= request.body.email;
			request.session._id 		= result._id;
			request.session.admin_name 	= request.body.name;
			request.session.adminUser	= result;
            response.redirect('brands');
        }
    });
 }else{
	response.render('pages/login',{errors:"",title:"Login"})
 }
});

app.all('/home', Auth, function(request, response) {
 	response.render('pages/home')
 });
 
app.all('/collection_view/:_id',Auth, function(request, response) {
	var brand_id = request.params._id
	mongo.connect(uristring, function (err, db) {
      if (err) {
		   db.close();	
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			respone.send(err);
      } else {
		console.log ('Succeeded connected to-: ' + uristring);
		db.collection("collections", function(err, collection) {
			// db.listCollections().toArray(function(error, result) {
			collection.find({"brand_id":brand_id}).toArray( function(error,result) {
			if (error){
				respone.send(err);
			} else{
				console.log("respone"+JSON.stringify(result));
				db.close();
				response.render('pages/collection_view',{url:"collection_view",data:result,brand_id:brand_id})
			}
     });
		});
      }
    });
 });

app.all('/brands', Auth, function(request, response) {
	mongo.connect(uristring, function (err, db) {
		if (err) {
		   db.close();
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			respone.send(err);
		} else {
			db.collection("brands", function(err, collection) {
				collection.find({}).toArray( function (error, success) {
					if(error){
						console.log("error : "+error);
					}else{
						// console.log("SS"+JSON.stringify(success.product_details));
						response.render('pages/brand',{url:"brands",data:success});
					}
				});
			});
		}
	});
 	
 });

app.all('/upload/:id', Auth,  function(request, response) {
	var id  = request.params.id;
	mongo.connect(uristring, function (err, db) {
		if (err) {
		   db.close();
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			respone.send(err);
		} else {
			db.collection("sheet_data", function(err, collection) {
				collection.find({"collection_id":id}).toArray( function (error, success) {
					if(error){
						console.log("error : "+error);
					}else{
						// console.log("SS"+JSON.stringify(success.product_details));
						response.render('pages/upload_new',{url:"upload",data:success,dataBase:id});
					}
				});
			});
		}
	});
 });


 
 
app.all('/add_image/:spu/:Col_name', function(request, response) {
	cloudinary.addImage( request.params,function (err, result) {
		if(err){
			response.json({"result":"failed"});
        }
        if(result == null) {
			response.json({"result":"failed"});
        }else{
			response.json(result);   
        }
    });
});

app.all('/delete_product_image/:col_name/:sku', function(request, response) {
	
	cloudinary.deleteImage( request.params,function (err, result) {
		if(err){
			response.json({"result":"failed"});
        }
        if(result == null) {
			response.json("success");
        }else{
			response.json("success");   
        }
    });
});

app.all('/update_product/:col_name/:sku/:spu', function(request, response) {
	cloudinary.updateImage( request.params,function (err, result) {
		if(err){
			response.json({"result":"failed"});
        }
        if(result == null) {
			response.json("success");
        }else{
			response.json("success");   
        }
    });
});

app.all('/sheet/:col_id', Auth, function(request, response) {
	var col_name  = request.params.col_name;
	var brand_id  = request.body._id;
	 if(request.method==='POST'){
		 googleSheet.googleSheet( request.body,function (err, result) {
			if(err){
				response.render('pages/sheet',{url:"collection_view", title:'get',data:"", data_base:col_name, brand_id:brand_id })	
			}
			if(result == null) {
				response.render('pages/sheet',{url:"collection_view", title:'get',data:"", data_base:col_name, brand_id:brand_id })	
			}else{
				response.render('pages/sheet',{url:"collection_view", title:'post',data:result, row:5, data_base:col_name, brand_id:brand_id})	
			}
		});
	}else{
		response.render('pages/sheet',{url:"collection_view", title:'get',data:"", data_base:col_name })	
	}
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});