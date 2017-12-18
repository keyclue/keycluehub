
var mongo = require('mongodb');
var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';
var uristring2 = 'mongodb://admin:admin123@ds135926.mlab.com:35926/';

var createBrand = function(input,callback){
	var brand_name  = "product_"+input.brand_name;
	uristring2 = uristring2 + brand_name;
	mongo.connect(uristring, function (err, db) {
		console.log("db"+JSON.stringify(err));
		
		if (err) {
			return callback(null, null); 
		}else{
			mongo.connect(uristring2, function (err, db) {
		console.log("db2"+JSON.stringify(err));
		
		if (err) {
			return callback(null, null); 
		}else{
			return callback(null, "success"); 
			db.close();
		}
			
	});
		}
			
	});
}
exports.createBrand = createBrand;

var deleteCollection = function(input,callback){
	var col_name  = input.col_name;
	mongo.connect(uristring, function (err, db) {
		if (err) {
			db.close();
			return callback(null, null); 
		} else {
			db.dropCollection(col_name, function(err, res) {
				if (err) {
					return callback(null, null); 
				}else{
					db.close();
					return callback(null, "success"); 
				}
			});
		}
	});
}
exports.deleteCollection = deleteCollection;

var saveSheetData = function(input,callback){
var data  = JSON.parse(input.data);
	var dataBase  = input.data_base;
	mongo.connect(uristring, function (err, db) {
		if (err) {
			db.close();
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			return callback(null, null); 
		} else {
			 db.collection(dataBase, function(err, collection) {
				collection.insert({"product_details":data}, function (err, success) {
					if (err) {
						return callback(null, null); 
					}else{
						db.close();
					 return callback(null, "success"); 
					}
				});
			});
		}
	});
}
exports.saveSheetData = saveSheetData;