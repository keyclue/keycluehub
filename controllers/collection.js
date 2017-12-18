
var mongo = require('mongodb');
var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';

var createCollection = function(input,callback){
	var col_name  = "product_"+input.col_name;
	mongo.connect(uristring, function (err, db) {
		if (err) {
			db.close();
			return callback(error);
		} else {
			db.createCollection(col_name, function(err, res) {
				if (err) {
					return callback(null, null); 
				}else{
					return callback(null, col_name); 
					db.close();
				}
			});
		}
	});
}
exports.createCollection = createCollection;

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