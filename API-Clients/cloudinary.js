
var mongo = require('mongodb');
var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';
var cloudinary = require('cloudinary');
	cloudinary.config({ 
		cloud_name: 'keyclue', 
		api_key: '813634257799733', 
		api_secret: 'BBItTIJqOnpuepu4IMjTpjzHG1E' 
	});

var createCollection = function(input,callback){
	var col_name  = input.col_name;
	var spu  = input.spu;
	
	cloudinary.v2.api.resources_by_tag(spu, function(error, result){
		if(error){
			return callback(null, null); 
		}else{
			if(result.resources == ""){
				return callback(null, null); 
			}else{
				return callback(null, result); 
			}
		}
	});
}
exports.createCollection = createCollection;

var deleteImage = function(input,callback){
	var col_name  = input.col_name;
	var sku  = input.sku;
	
			mongo.connect(uristring, function (err, db) {
				if (err) {
					db.close();
					console.log ('ERROR connecting to: ' + uristring + '. ' + err);
					return callback(null, null); 
				} else {
					
					db.collection(col_name, function(err, collection) {
						collection.update({"product_details.sku":sku},{ $set: { "product_details.$.image": "" }},function(error, success){
							if(error){
							
								return callback(null, "success"); 
							}else{
								db.close();
								return callback(null, "success"); 
							}
						
						});
					});
				}
		});
		
 
}
exports.deleteImage = deleteImage;

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