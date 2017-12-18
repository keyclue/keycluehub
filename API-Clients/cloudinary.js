
var mongo = require('mongodb');
var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';
var cloudinary = require('cloudinary');
	cloudinary.config({ 
		cloud_name: 'keyclue', 
		api_key: '813634257799733', 
		api_secret: 'BBItTIJqOnpuepu4IMjTpjzHG1E' 
	});

var addImage = function(input,callback){
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
exports.addImage = addImage;

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

var updateImage = function(input,callback){
	var col_name  = input.col_name;
	var sku  = input.sku;
	var spu  = input.spu;
	var cloudinary = require('cloudinary');
	cloudinary.v2.api.resources_by_tag(spu, function(error, result){
		if(error){
			console.log ('ERROR');
			return callback(null, null); 
		}else{
			mongo.connect(uristring, function (err, db) {
				if (err) {
					db.close();
					console.log ('ERROR connecting to: ' + uristring + '. ' + err);
					return callback(null, null); 
				} else {
					
					db.collection(col_name, function(err, collection) {
						collection.update({"product_details.sku":sku},{ $set: { "product_details.$.image": result.resources[0].url }},function(error, success){
							if(error){
								console.log ('ERROR--'+error);
								return callback(null, "success"); 
							}else{
								console.log ('ERROR7777'+JSON.stringify(success));
								return callback(null, "success"); 	
							}
						
						});
					});
				}
		});
		}
		});
		
 
}
exports.updateImage = updateImage;