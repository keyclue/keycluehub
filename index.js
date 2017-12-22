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

/* proxy*/
var request = require('request');

var options = {
    proxy: 'http://9zn658nv8z7o3r:pnY7D16UlNWoWDofP9ZgjhZhyA@us-east-static-04.quotaguard.com:9293',
    url: 'https://sheltered-caverns-33023.herokuapp.com/add_product',
    headers: {
        'User-Agent': 'node.js'
    }
};    

function callback1(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log("body+" + body);
    }
}

request(options, callback1);

/* proxy*/



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
 
app.get('/delete_collection/:col_id/:brand_id',function(request,response){
	collection.deleteCollection( request.params,function (err, result) {
		if(err){
			response.redirect('/collection_view/'+request.params.brand_id);    
        }
        if(result == null) {
			response.redirect('/collection_view/'+request.params.brand_id);    
        }else{
			response.redirect('/collection_view/'+request.params.brand_id);    
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

app.all('/sheet/:col_id/:brand_id', Auth, function(request, response) {
	var col_name  = request.params.col_id;
	var brand_id  = request.params.brand_id;
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


/* testing api for another library of Tmall */
/* app.all('/top1', function(request, response) {
	
var top = require('top');
var client = top.createClient({
	 appkey: '23557753',
			appsecret: 'fe07dd33eac65c1b13324395a2cde358',
			session :'61000051ff9e5102f2b320f2a2e773f0dafecc6ca1e5bd13031625218'
	});
	// invoke 'taobao.user.get': http://api.taobao.com/apidoc/api.htm?path=cid:1-apiId:1
	client.taobao_user_get({nick: 'john', fields: 'user_id,nick,seller_credit'}, function (err, user) {
	  console.log(user);
	  console.log(err);
	  response.send({"user":user,"err":err});
	});
	
}); */
/* app.all('/sandbox_add_product', function(request, response) {
var ApiClient = require('./lib/api/topClient.js').TopClient;
const client = new ApiClient({
    // 'appkey':'23897902',
    // 'appsecret':'26657347b25d2e4bb454696ae717f988',
	'appkey': '23557753',
	'appsecret': 'fe07dd33eac65c1b13324395a2cde358',
    'url':'http://gw.api.taobao.com/router/rest'
});

client.execute('alibaba.aliqin.fc.sms.num.send',
    {
        'rec_num':'17612345678',
        'sms_free_sign_name':'就业指导中心',
        'sms_param': '{"name":"姓名"}',
        'sms_template_code': 'SMS_70135147',
        'sms_type': 'normal'
    },
    function (error,res) {
        if(!error){
            console.log(res);
            response.send(res);
		} else{
            console.log(error);
            response.send(error);
		}
    }
);
}); */

app.all('/search_product', function(request, response) {
	var taobao = require('taobao');
	taobao.core.call({
		'app_key': '23557753',
		'app_secret': 'fe07dd33eac65c1b13324395a2cde358',
		'session': '61000051ff9e5102f2b320f2a2e773f0dafecc6ca1e5bd13031625218',
		'method': 'taobao.products.search',
		'fields': 'product_id,name,pic_url,cid,props,price,tsc',
		'cid': '50011999',
		'status': '3'		
	}, function(data) {
		response.send(data);
	});
});


app.all('/add_product', function(request, response) {
	var jpeg = require('jpeg-js');
	var fs = require('fs');
	//var md5 = require('md5'); // uninstall this module
	// var base64Img = require('base64-img'); // uninstall this module
	var jpegData = fs.readFileSync('./woman.jpg');
	var rawImageData = jpeg.decode(jpegData, true);
	var taobao = require('taobao');
	/* var configVar = {
		app_key: '23557753',
		app_secret: 'fe07dd33eac65c1b13324395a2cde358',
		session :'61000051ff9e5102f2b320f2a2e773f0dafecc6ca1e5bd13031625218',
		method: 'taobao.product.add'
	};
	taobao.config(configVar); */
 
	taobao.core.call({
		method: 'get',				//可选，默认为get, 各个API需要的method可能不一样，请参阅淘宝API文档 
		protocol: 'http',			//可选，默认为http, 指定协议，支持http, https 
		sandbox: false				//可选，默认为false, 指定是否为沙箱环境，可通过taobao.config配置默认值 
	}, {
		'app_key': '23557753',
		'app_secret': 'fe07dd33eac65c1b13324395a2cde358',
		'session':'61000051ff9e5102f2b320f2a2e773f0dafecc6ca1e5bd13031625218',
		'method': 'taobao.item.add',
		'cid':'50011999',
		// 'outer_id':'96330012',
		//'props':'pid:vid;pid:vid',
		// 'binds':'pid:vid;pid:vid',
		// 'sale_props':'pid:vid;pid:vid',
		// 'customer_props':'20000:UNIQLO:Model:001:632501:1234',
		// 'price':'200.07',
		'image':'I uploaded the content',         
		// 'raw_image':'https://img.alicdn.com/bao/uploaded/i1/2274014597/TB2B_YOXam5V1BjSspoXXa8VXXa_!!2274014597.jpg',
		// 'image':imageData,
		// 'name':'notebook',
		// 'desc':'Thisisaproductdescription',
		// 'major':'true',
		// 'vertical_market':'4',
		// 'market_time':'2018-01-01 00:00:00',
		// 'property_alias':'1627207:3232483:Deepgreen',
		// 'packing_list':'Instructions:1;headset:1;charger:1',
	   // 'extra_info':'{"field_key": "description", "field_name": "Introduction", "field_value": "I am the introduction"}, {"field_name": "directory", "field_value": "I am the directory"}',
		// 'market_id':'2',
		// 'sell_pt':'Starthesameparagraph',
		// 'template_id':'1',
		//'suite_items_str':'1000000062318020:1;1000000062318020:2;',
	   // 'is_pub_suite':'false'
		
	}, function(error, data) {
		console.log("error"+error);
		console.log("data"+data);
		response.send(error);
	});
});
app.all('/edit_sheet/:col_id/:brand_id', Auth, function(request, response) {
	var col_id    = request.params.col_id; //collection_id
	var brand_id  = request.params.brand_id; //brand_id
	 if(request.method==='POST'){
		 googleSheet.saveData( request.body,function (err, result) {
			if(err){
				response.render('pages/sheet',{url:"edit_sheet", title:'get',data:"", data_base:col_id, brand_id:brand_id })	
			}
			if(result == null) {
				response.render('pages/sheet',{url:"edit_sheet", title:'get',data:"", data_base:col_id, brand_id:brand_id })	
			}else{
				response.render('pages/sheet',{url:"edit_sheet", title:'post',data:result, row:5, data_base:col_id, brand_id:brand_id})	
			}
		});
	}else{
		googleSheet.getSheetData( request.params,function (err, result) {
		if(err){
				response.render('pages/edit_sheet',{url:"edit_sheet", title:'get',data:"", data_base:col_id, brand_id:brand_id })	
			}
			if(result == null) {
				response.render('pages/edit_sheet',{url:"edit_sheet", title:'get',data:"", data_base:col_id, brand_id:brand_id })	
			}else{
				response.render('pages/edit_sheet',{url:"edit_sheet", title:'post',data:result, row:5, data_base:col_id, brand_id:brand_id})	
			}	
		});
	}
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});