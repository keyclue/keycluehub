
var mongo = require('mongodb');
var uristring = 'mongodb://admin:admin123@ds135926.mlab.com:35926/heroku_914rlv3g';
var login = function(input,callback){
			var email       = input.email;
			var password    = input.password;
	mongo.connect(uristring, function (err, db) {
      if (err) {
		   db.close();
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			respone.send(err);
      } else {
		  db.collection("admins", function(err, collection) {
            collection.findOne({email:email}, function (error, success) {
               if(error){
                    return callback(error);
               }
               console.log("success"+success);
               if(success!=null){
                   console.log("success1");
                   if(success.password===password){
                   // if(decrypt(success.password)===password){
				                      
                    return callback(null,success);
                   }else{
                      return callback(null,null);
                   }
               }else{
                   return callback(null,null);
               }

            }	);
            }	);
	  }
			});
			}
			
			exports.login = login;