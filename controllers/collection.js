
var mongo = require('mongodb');
var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';

var createCollection = function(input,callback){
	var col_name  = input.col_name;
	var id  = input._id;
	mongo.connect(uristring, function (err, db) {
		if (err) {
			db.close();
			return callback(error);
		} else {
			 db.collection("collections", function(err, collection) {
				collection.insert({"name":col_name, "brand_id":id}, function (err, result) {
					if (err) {
						return callback(null, null); 
					}else{
						return callback(null, id); 
						db.close();
					}
				});
			});
		}
	});
}
exports.createCollection = createCollection;

var deleteCollection = function(input,callback){
	var col_name  = input.col_id;
	var brand_id  = input.brand_id;
	mongo.connect(uristring, function (err, db) {
		if (err) {
			db.close();
			return callback(null, null); 
		} else {
			 db.collection("collections", function(err, collection) {
				collection.remove({"_id":col_name}, function (err, success) {
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
exports.deleteCollection = deleteCollection;

var saveSheetData = function(input,callback){
var data  = JSON.parse(input.data);
	var collection_id  = input.data_base;
	mongo.connect(uristring, function (err, db) {
		if (err) {
			db.close();
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			return callback(null, null); 
		} else {
			 db.collection("sheet_data", function(err, collection) {
				collection.insert({"product_details":data,"collection_id":collection_id}, function (err, success) {
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