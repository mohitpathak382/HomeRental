var express = require('express');
var bcrypt = require('bcrypt');
var path=require('path');
var fs = require('fs');
var app = express();
var session = require('express-session');
var moment = require('moment');
var bodyParser = require('body-parser');
const split = require('split-string');
const querystring = require('querystring'); 
const mongoose = require("mongoose");
const multer=require("multer");
require('dotenv').config();
const connectionString = process.env.MONGODB_URI;


const User=require('./Model/customer.js');
const HouseDetail=require('./Model/house.js');
const Admin=require('./Model/admin.js');

const { result } = require('underscore');

const connectionParams={
	useNewUrlParser:true,
	useUnifiedTopology:true
}
app.use(express.static(require('path').join(__dirname + '/Public')));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, 'Public/uploads/');
	},
	filename: function (req, file, cb) {
	  cb(null, file.originalname);
	},
  });
  
  
  const upload = multer({ storage: storage });
  app.use('/uploads', express.static(path.join(__dirname, 'Public/uploads')));

  
mongoose.connect(dburl,connectionParams).then( () => {
	console.info("Connected to the DB");
})
.catch((e)=>{
	console.log("Erorr: ",e);
});

// app.engine('ejs', require('ejs').renderFile);/

app.set('view engine', 'ejs');

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration:  10 * 1000,
  activeDuration: 10 * 1000,
  resave: true,
  saveUninitialized: true
}));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

users = [];
 var connections = [];
var urlencodedParser = bodyParser.urlencoded({ extended: false})

app.get('/',function(req,res) {
	res.render( 'start', {
		username: 'hi',
		passwordIncorrect: ' ',
		userNotRegistered: ' '
	});
})
app.get('/customerLogin',function(req,res) {
	console.log(req.session.user);
	res.render( 'customerLogin', {
		passwordIncorrect: ' ',
		userNotRegistered: ' ',
		loginAgain:' '
	});
})
app.get('/adminLogin',function(req,res) {
	console.log(req.session.user);
	res.render( 'adminLogin', {
		passwordIncorrect: ' ',
		userNotRegistered: ' ',
		loginAgain:' '
	});
})

app.get('/adminRegister',function(req,res) {
	res.render( 'adminRegister', {
		usernameTaken:' ',
		emailTaken:' '
	});
})
app.get('/register',function(req,res) {
	res.render( 'register', {
		usernameTaken:' ',
		emailTaken:' '
	});
})

app.get('/house-register',function(req,res) {
	res.render( 'house-register', {
		housetaken:''
	});
})

app.get('/dashboard', function(req, res) {
	if (req.session && req.session.user) {
		const role = req.session.user.role;
		if (role === 'admin') {
			Admin.find({ email: { $ne: req.session.user.email } })
				.exec()
				.then((result) => {
					res.render('welcome', {
						user: req.session.user,
						members: result,
					});
				})
				.catch((err) => {
					console.log('Error occurred while fetching users:', err);
					res.render('error', { message: 'Error occurred while fetching users' });
				});
		} else {
			User.find({ email: { $ne: req.session.user.email } })
				.exec()
				.then((result) => {
					res.render('welcome', {
						user: req.session.user,
						members: result,
					});
				})
				.catch((err) => {
					console.log('Error occurred while fetching users:', err);
					res.render('error', { message: 'Error occurred while fetching users' });
				});
		}
	} else {
		if(req.session.user==='admin'){
		console.log('Login again!!');
			res.render('adminLogin', {
				passwordIncorrect: '',
				userNotRegistered: '',
				loginAgain: 'Session expired, Login Again!!'
			});
		}
		else{
			console.log('Login again!!');
			res.render('customerLogin', {
				passwordIncorrect: '',
				userNotRegistered: '',
				loginAgain: 'Session expired, Login Again!!'
			});
		}
	}	
});

  app.get('/dashboard/preference', async function(req, res) {
	  if (req.session && req.session.user) {
		  var cat = req.query.category;
		  var loc = req.query.Locality;
		  var bed = req.query.bedroom;
		  var uname = req.session.user.username;
		  
		  let query = {};
		  console.log(bed, cat, loc);
		  if (cat !== '') {
			  query.category = cat;
			}
			if (bed !== '') {
				query.bhk = bed;
			}
			if (loc !== '') {
				query.locality = loc;
			}
			
			try {
				const userId = req.session.user._id;
		const users = await User.findOne({ _id: userId });
		const houses = await HouseDetail.find(query).exec();
		console.log(houses);
		
		const arrPromise = User.findOne({ username: req.session.user.username }, 'bookmarks').exec();
		const bookmarksArray = await arrPromise;
		
		console.log(bookmarksArray);
		
		res.render('preference', {
				user: req.session.user,
				houseDetails: houses,
				bookmarks: req.session.user.role === 'customer' ? bookmarksArray.bookmarks : []
		});
	  } catch (err) {
		console.log('Error occurred:', err);
		res.status(400).send({
		  code: 400,
		  failed: 'Error occurred'
		});
	  }
	} else {
		console.log('Login again!!');
		res.render('start', {
			passwordIncorrect: ' ',
			userNotRegistered: ' ',
			loginAgain: 'Session expired, Login Again!! '
		});
	}
});


app.get('/logout', function(req, res) {
	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else {
			res.redirect('/');
		}
	});
});
app.get('/profile', async function(req, res) {
	try {
		// var uid = req.session.user.id;
		console.log(req.session.user);
        const user = await User.findById(req.session.user.id);
		console.log(user,req.session.user.id);  
        res.render('profile', { user: user,});
    } catch (error) {
		console.error(error);
        // Handle error and redirect to an error page or display an error message
    }
});
app.get('/stats', function(req, res) {
	// Get the statistics you need from your database or other data source
	const houseCount = HouseDetail.countDocuments();
	const userCount = User.countDocuments();
	const averageRating = User.aggregate([{ $group: { _id: null, avgRating: { $avg: "$feedback" } } }]);
	const flatCount = HouseDetail.countDocuments({ category: 'Flat' }); 
	// You can add more statistics calculations as needed
  
	// Execute all the queries to fetch the data
	Promise.all([houseCount, userCount, averageRating,flatCount])
	  .then((results) => {
		const [houseCountResult, userCountResult, averageRatingResult,flatCountResult] = results;
  
		// Render the stats template and pass the data to it
		res.render('stats', {
			userCount: userCountResult,
			houses: houseCountResult,
			flatCount: flatCountResult,
			houseCount:houseCountResult-flatCountResult,
		  averageRating: averageRatingResult[0].avgRating,
		  // Add more data as needed
		});
	  })
	  .catch((err) => {
		console.log('Error occurred while fetching stats:', err);
		res.render('error', { message: 'Error occurred while fetching stats' });
	  });
  });
  
  

  
app.get('/bookmarked', async function(req, res) {
	try {
		const userId = req.session.user.id;
		// Find the user by ID and retrieve the bookmarks array
		const user = await User.findById(userId).lean();
		// Extract the bookmarked house IDs
		const bookmarkedHouseIds = user && user.bookmarks ? user.bookmarks : [];
		// Fetch the House documents for the bookmarked house IDs
		const bookmarkedHouses = await HouseDetail.find({ _id: { $in: bookmarkedHouseIds } });
		res.render('bookmarks', { houses: bookmarkedHouses,user:user});
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

app.get('/updateHouse/:houseId', async (req, res) => {
	const houseId = req.params.houseId;
  console.log(houseId); 	 
	try {
		const oId = new mongoose.Types.ObjectId(houseId);
	  // Retrieve the house details based on the provided houseId
	  const house = await HouseDetail.findById(oId);
  
	  // Render the update form with the house details
	  res.render('updatehouse-frm', { house });
	} catch (error) {
	  console.error(error);
	  res.sendStatus(500);
	}
  });
  
app.get('/removeHouse/:houseId', async (req, res) => {
	const houseId = req.params.houseId;
	try {
		
	  await HouseDetail.deleteOne({ _id: houseId });
	  console.log("Deleted Successfully");
	  const referer = req.headers.referer;
	  res.redirect(referer);
	} catch (error) {
	  console.error(error);
	  res.sendStatus(500);
	}
  });
app.post('/customerLogin',urlencodedParser,function(req,res){
	var	email = req.body.userEmail;
	var	password = req.body.userPassword;
	
	User.findOne({ email: email })
	.then((user) => {
	  if (!user) {
		res.render('customerLogin', {
			passwordIncorrect: '',
			userNotRegistered: 'User Not registered Register First',
			loginAgain: ''
		  });
		return;
	  }

	  bcrypt.compare(password, user.password, (err, result) => {
		if (err) {
		  res.send('Error occurred during login');
		  return;
		}

		if (result) {
		  console.log('Login successful');
		  const authenticatedUser = { id: user._id, username: user.username,role:"customer"};
		req.session.user = authenticatedUser; // Set the user object in 
		  res.redirect('/dashboard');
		} else { 
			res.render('customerLogin', {
			passwordIncorrect: 'Invalid  Email Or Password',
			userNotRegistered: '',
			loginAgain: ''
		  });
		}
	  });
	})
	.catch((err) => {
	  res.send('Error occurred during login');
	});
});

app.post('/adminLogin',urlencodedParser,function(req,res){
	var	email = req.body.email;
	var	password = req.body.Password;
	console.log(email,password);
	Admin.findOne({ email: email })
	.then((admin) => {
	  if (!admin) {
		res.render('adminLogin', {
			passwordIncorrect: '',
			userNotRegistered: 'Admin Not registered',
			loginAgain: ''
		  });
		return;
	  }

	  bcrypt.compare(password, admin.password, (err, result) => {
		if (err) {
		  res.send('Error occurred during login');
		  return;
		}

		if (result) {
		  console.log('Login successful');
		  const authenticatedAdmin = { id: admin._id, username: admin.name,role:"admin"};
			req.session.user = authenticatedAdmin; // Set the user object in 
		  res.redirect('/dashboard');
		} else { 
			res.render('adminLogin', {
			passwordIncorrect: 'Invalid  Email Or Password',
			userNotRegistered: '',
			loginAgain: ''
		  });
		}
	  });
	})
	.catch((err) => {
	  res.send('Error occurred during login');
	});
});


app.post('/adminRegister',urlencodedParser,function(req,res ,next){
	var uname = req.body.name;
	var mail = req.body.email;
	const saltRounds=10;
	var password = req.body.password;

	Admin.findOne({ name: uname })
	.then((admin) => {
	  if (admin) {
		console.log("Admin exists");
		res.render('adminRegister', {
		  message: 'Admin already exists. Please login or register with new details.',
		});
	  } else {
		bcrypt.hash(password, saltRounds, function(err, hash) {
		  if (err) {
			console.log("Error occurred during password hashing:", err);
			res.status(500).send("Error occurred during registration");
		  } else {
			const newAdmin = new Admin({
			  name: uname,
			  email: mail,
			  password: hash, // Store the hashed password
			});

			newAdmin.save()
			  .then(() => {
				console.log("Registration successful");
				console.log(uname + " , " + password);
				res.redirect('/adminLogin');
			  })
			  .catch((err) => {
				console.log("Error occurred during registration", err);
				res.status(500).send("Error occurred during registration");
			  });
		  }
		});
	  }
	})
	.catch((err) => {
	  console.log("Error occurred", err);
	  res.status(500).send("Error occurred");
	});
});
app.post('/register',urlencodedParser,function(req,res ,next){
	var uname = req.body.username;
	var mail = req.body.email;
	var contact = req.body.mobile;
	var add = req.body.address;
	var gender = req.body.gender;
	const saltRounds=10;
	var password = req.body.password;

	User.findOne({ username: uname })
	.then((user) => {
	  if (user) {
		console.log("User exists");
		res.render('customerRegister', {
		  message: 'User already exists. Please login or register with new details.',
		});
	  } else {
		bcrypt.hash(password, saltRounds, function(err, hash) {
		  if (err) {
			console.log("Error occurred during password hashing:", err);
			res.status(500).send("Error occurred during registration");
		  } else {
			const newUser = new User({
			  username: uname,
			  email: mail,
			  gender: gender,
			  contact: contact,
			  address: add,
			  password: hash, // Store the hashed password
			  feedback:0,
			});

			newUser.save()
			  .then(() => {
				console.log("Registration successful");
				console.log(uname + " , " + password);
				res.redirect('/customerLogin');
			  })
			  .catch((err) => {
				console.log("Error occurred during registration", err);
				res.status(500).send("Error occurred during registration");
			  });
		  }
		});
	  }
	})
	.catch((err) => {
	  console.log("Error occurred", err);
	  res.status(500).send("Error occurred");
	});
});

app.post('/house-register', urlencodedParser, upload.single('image'), async (req, res) => {
	var username = req.body.username;
	var mobile = req.body.mobile;
	var address = req.body.address;
	var category = req.body.category;
	var locality = req.body.locality;
	var rent = req.body.rent;
	var facing = req.body.facing;
	var about = req.body.description;
	var bhk = req.body.BHK;
	const file = req.file;

	try {
		if (!file) {
			res.status(400).send('No file uploaded');
			return;
		}

		// Create a new house detail document
		const houseDetail = new HouseDetail({
			username,
			mobile,
			address,
			category,
			locality,
			rent,
			facing,
			about,
			bhk,
			filename: file.originalname,
			contentType: file.mimetype,
			data: file.buffer,
		});

		// Save the document to the database
		const savedHouseDetail = await houseDetail.save();

		console.log('Register Successful');
		console.log(address + ' , ' + rent);
		res.redirect('/dashboard');
	} catch (err) {
		console.error('Error registering house:', err);
		res.status(500).send('Failed to register house');
	}
});
  

app.post('/bookmark/:userId/:houseId', async (req, res) => {
	const { userId, houseId } = req.params;

  try {
	// Find the customer by ID and update the bookmarks array
	await User.updateOne({ _id: userId }, { $push: { bookmarks: houseId } });
	console.log("BookeMarked Successfully");

	const referer = req.headers.referer;
	res.redirect(referer);
  } catch (error) {
	console.error(error);
	res.sendStatus(500);
  }
});

app.post('/unbookmark/:userId/:houseId', async (req, res) => {
	const { userId, houseId } = req.params;

  try {
	// Find the customer by ID and update the bookmarks array
	await User.updateOne({ _id: userId }, { $pull: { bookmarks: houseId } });
	console.log("UnBookeMarked Successfully");

	const referer = req.headers.referer;
	res.redirect(referer);
  } catch (error) {
	console.error(error);
	res.sendStatus(500);
  }
});

app.post('/feedback',urlencodedParser,function(req,res){
	if (req.session && req.session.user) {
		var uname = req.session.user.username;
		var rating = req.body.star;
		
		User.updateOne({ username: uname }, { $set: { feedback: rating } })
		  .then(result => {
			console.log("Rating Updated Successfully");
			res.redirect('/dashboard');
		  })
		  .catch(error => {
			console.log("Error Occurred While Updating");
			res.send({
			  "code": 400,
			  "failed": "Error occurred"
			});
		  });
	  }	  
});


var server = app.listen(8081 , function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log(host+" "+port);
})
