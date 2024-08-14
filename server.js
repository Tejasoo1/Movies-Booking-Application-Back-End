const Express = require("express");
const app = Express();
// app.use(Express.json());
const Bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const Crypto = require("crypto");

// Middleware to parse JSON bodies with a limit of 10MB
app.use(Express.json({ limit: "10mb" }));

// Middleware to parse URL-encoded bodies with a limit of 10MB
app.use(Express.urlencoded({ limit: "10mb", extended: true }));

const RazorPayDetails = new Razorpay({
  key_id: "rzp_test_nYzcBduG1fFZdb",
  key_secret: "jAg7MdZ7kdF6iDt1WJg7aTVJ",
});

const CORS = require("cors"); //import 'cors' library

/* 
 1] Now i need to tell, Express application you please use the "cors" library to solve the issue.
 2] Now your express application will be in a position to collect the request coming from any
    port number.
*/
app.use(CORS());

/*
1] 'TMDB' API will give you the movie details.
2] I want to get the movie details & store/save them.
   So, when you want to 'save' some data OR 'create' some data then we use "POST" 
   method.

3] Till now we were connecting to MongoDB, which is running in my local computer(Server).  
   Now i will connect to the MongoDB which is running in some different computer (server)
   somewhere in the internet.
   
4] Visit website:- MongoDB Atlas.
   So, we will connect our Application to this computer in which MongoDB is already installed,
   which is provided/created by Atlas & maintained by AWS.

*  MongoDB Atlas will provide you with a connection string:-
?  mongodb+srv://TejasPatilHawk:tejas99patil@cluster0.vjpqcxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
 
5] In this backend application, you need to write the logic to read the data from database.
   And after reading the data from DB, give that data to the FrontEnd.

 ~ If i want to read the data from DB, i need to connect my backend App. with MongoDB Atlas.\

* *******************************************************************************************************

1] I have to read the data from 'moviedatabase' which is inside MongoDB Atlas.

  ...net/moviedatabase?...
             |  
             |
             |---> Specify the name of the database, to which we want to connect.
             
2] Now inside this 'moviedatabase' i want to read the data from 'moviescollection':-
   
   i] First create a Plan/Blueprint/Schema. 

*/

//Setting up the DB.
const Mongoose = require("mongoose");
const { type } = require("os");

//So, this line of code will basically connect our express application to MongoDB Atlas.
//Now inside MongoDB Atlas, i have to connect to "moviedatabase".
Mongoose.connect(
  "mongodb+srv://TejasPatilHawk:tejas99patil@cluster0.vjpqcxj.mongodb.net/moviedatabase?retryWrites=true&w=majority&appName=Cluster0"
);

//Creating a "Schema" for moviescollection.
const MovieSchema = new Mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  movie_name: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    unique: true,
  },
  genre: {
    type: String,
  },
  censor: {
    type: String,
  },
  director: {
    type: String,
    // unique: true,
  },
  cast: {
    type: Array,
  },
});

//Accessing the moviescollection (Make sure you create a collection in plural format in MongoDB Atlas)
const MovieModel = Mongoose.model("moviescollections", MovieSchema);

//Schema for "Signup"
const SignUpSchema = new Mongoose.Schema({
  username: String,
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    unique: true,
  },
});

//Creating "signups" collection.
const SignUpModel = Mongoose.model("signups", SignUpSchema);

//Schema for "Locations And Theaters"
/*
  {
    location: 'Mumbai',
    theaters: [
      {
        theaterName: 'PVR Lower Parel',
        showTimes: ['8:00 AM', '11:00 AM', '3:00 PM', '6:00 PM', '9:00 PM'],
      },
      {
        theaterName: 'Cineworld Andheri',
        showTimes: ['9:30 AM', '12:30 PM', '4:00 PM', '7:30 PM', '10:30 PM'],
      },
      {
        theaterName: 'IMAX Versova',
        showTimes: ['10:00 AM', '1:00 PM', '5:00 PM', '8:00 PM', '11:00 PM'],
      },
    ],
  },
*/

const SeatNosSchema = new Mongoose.Schema({
  category: String,
  rowName: String,
  no: Number,
  booked: Boolean,
  soldOut: Boolean,
});

const SeatsInfoSchema = new Mongoose.Schema({
  rowName: String,
  seatNos: [SeatNosSchema],
});

const RowsSchema = new Mongoose.Schema({
  section: String,
  seatsInfo: [SeatsInfoSchema],
});

const TimesSchema = new Mongoose.Schema({
  time: String,
  rows: Array,
});

const DatesSchema = new Mongoose.Schema({
  date: String,
  // showTimes: Array,
  showTimes: [TimesSchema],
});

const TheaterSchema = new Mongoose.Schema({
  theaterName: String,
  showDates: [DatesSchema],
});

const LocationSchema = new Mongoose.Schema({
  location: String,
  theaters: [TheaterSchema],
});

//Create "locationandtheaters" collection:-
const LocationModel = Mongoose.model("locationandtheaters", LocationSchema);

//Schema for BookingHistory.
const BookingHistoryArraySchema = new Mongoose.Schema({
  movieDetails: Object,
  totalTickets: Number,
  totalCost: Number,
  currLocation: String,
  theaterName: String,
  date: String,
  time: String,
  seatInfo: String,
  day: String,
});

const BookingHistorySchema = new Mongoose.Schema({
  userEmail: {
    type: String,
    unique: true,
  },
  bookingHistoryArray: [BookingHistoryArraySchema],
});

//Creating a collection for BookingHistory:-
const BookingHistoryModel = Mongoose.model(
  "bookinghistorycollections",
  BookingHistorySchema
);

//Endpoints
/*
* Endpoint to fetch movies data & store that data into DB (i.e. to create new documents based on fetched data)
  app.post("/fetch/movies", (req, res) => {}); 
! Not needed as we are not using TMDB API for fetching movies data.
*/

//To read all the movies data from MongoDB atlas.
app.get("/fetch/all/movies", async (req, res) => {
  //Logic to read the data/documents from 'moviescollection'
  const movieDetails = await MovieModel.find();
  // console.log(movieDetails);

  /*
   1] This movieDetails (array of movie objects) we need to give it to our FrontEnd.
   2] My backend has to send "JSON" data as movieDetails is in 'JSON' format.
  */

  res.json(movieDetails);
});

//To collect the 'signup' form data & then create a 'signup' document using that data.
/*
 1] When you want to insert/create some data(document) from the incoming(form) data,
    for that, you will use 'POST' method.

 2] When passwords don't match, the backend responds with a '400' status code and an error message.
 3] If there's an error while saving the data, the backend responds with a '500' status code and
    an error message.   

  ~ 500 Internal Server Error:-
    Description: The '500' status code indicates that the 'server' encountered an unexpected condition 
                 that prevented it from fulfilling the 'request'. 
                 It means something went wrong on the server's side.
 
    When to Use: Use '500' when there is a server-side error, such as an 'exception' while processing 
                 the request, database connection failures, or any other issue that prevents the 
                 server from fulfilling the request.

    Example: In your signup example, if there's an error while saving the user's data to the database, 
             it's a server-side error, and the server should respond with a '500' status code

  ~ 400 Bad Request:-
    Description: The '400' status code indicates that the server could not understand the 'request' 
                 due to invalid syntax. 
                 It means the request sent by the 'client' is incorrect or corrupted, and the server
                 is unable to process it.

    When to Use: Use '400' when the client sends malformed or invalid data, such as missing required 
                 parameters, invalid query parameters, or any other validation errors.

    Example: In your 'signup' example, when the passwords don't match, it's a client-side error because
             the input provided by the user doesn't meet the expected criteria.         
*/
app.post("/signup", async (req, res) => {
  // console.log(req.body);
  const signupDetails = req.body;

  const hashedPasswordWithSalt = await Bcrypt.hash(signupDetails.password, 10);

  const SignUpData = new SignUpModel({
    username: signupDetails.username,
    email: signupDetails.email,
    password: hashedPasswordWithSalt,
  });

  if (signupDetails.password === signupDetails.confirmpassword) {
    SignUpData.save()
      .then((doc) => {
        console.log(doc);
        //Once the data/document is saved,then i need to return it back to 'SignIn' page.
        res.send("Registration Successfull !!!");
      })
      .catch((err) => {
        // console.log(err);
        // res.send(err);
        res
          .status(500)
          .send({ error: "An error occurred while saving the data." });
      });
  } else {
    // res.send("Passwords doesn't match");
    res.status(400).send({ error: "Passwords don't match" });
  }
});

//To collect the 'signin' form data.
app.post("/signin", async (req, res) => {
  const signinDetails = req.body;
  console.log(signinDetails);

  const signInData = await SignUpModel.findOne({ email: signinDetails.email });

  if (signInData !== null) {
    //Entered email is valid.
    //Now, check whether the entered password is valid or not.
    const actualPassword = signInData.password;
    const enteredPassword = signinDetails.password;

    const confirmationOutput = await Bcrypt.compare(
      enteredPassword,
      actualPassword
    );

    if (confirmationOutput) {
      res.send("Login Successfull !!!");
    } else {
      res.status(500).send({ error: "Invalid Password !!!" });
    }
  } else {
    res.status(500).send({ error: "Invalid Email !!!" });
  }
});

//To get the locations & theaters data(array of objects)
app.get("/locations", async (req, res) => {
  const LocationDetails = await LocationModel.find();
  res.json({ info: LocationDetails });
});

/*
  1] Razorpay ----> Payment Gateway ---> card, UPI, bank, ..... ----> Dummy Payment.
  2] npm i razorpay.
  3] Who will communicate with the Razorpay ---> Always Backend Application.
  4] If your backend has to connect/communicate with 'razorpay' then you need to specify 2 keys:-
     razorpay_id & razorpay_secret_key. 

     If these two details are valid, then my backend will be able to connect with the razorpay.
   
  5] const razorPayDetails = new Razorpay({
         key_id: "rzp_test_nYzcBduG1fFZdb",
         key_secret: "jAg7MdZ7kdF6iDt1WJg7aTVJ",
       });   

  6] Now we need to create 2 endpoints:-
     1] create the order ---> book the ticket for (total amount) Rs.
          |
          |
          |--> Whatever the total amount you pass from the front-end to the backend,
               with that amount you'll create one order. 
          
          
     2] verify the order.
          |
          |
          |--> Once you verify the order, only then you'll get the confirmation message
               telling order is successfull.     
               
               So any data which is coming from front-end, is that data really coming from 
               front-end OR some other application, you have to verify that order. 

               if the verification is successfull, then you'll place the order, telling
               order is successfull.      
               
               
 7] If you want to generate some unique information randomly in Node.js, then for that
    you have 1 inbuilt library available in Node.js -----> crypto 

*/

app.post("/create/order", (req, res) => {
  const enteredAmount = req.body.totalAmount;
  console.log(enteredAmount);

  const option = {
    amount: enteredAmount * 100,
    currency: "INR",
    //Storing randomly generated bytes(10) in hexadecimal format.
    // bookingfId: Crypto.randomBytes(10).toString("hex"),
  };

  //Whatever is there in 'option' obj, with those details i need to create an order.
  /*
   1] Using Razorpay you have to create the order.
   2] RazorPayDetails --> This will connect to rajorpay because of key_id & secret_key.

      RazorPayDetails.orders.create(option,);
                                     |
                                     | 
                                     |---> Whatever the order you want to create, its details
                                           are present in option object. 

   3] Can you always guarantee, create() method will every time create the order.
   --> No (There is a chance it can not create)

   4] Hence, pass one callback func. which accepts 2 parameters:- error, orderInfo   

      orderInfo:=
      {
         amount: 1650,
         amount_due: 1650,
         amount_paid: 0,
         attempts: 0,
         created_at: 1723534759,
         currency: 'INR',
         entity: 'order',
         id: 'order_OkIvButDapBNoH',
         notes: [],
         offer_id: null,
         receipt: null,
         status: 'created'
      }

   5] Now we did not pay the amount yet, just created order.

     Q. When we will pay the amount ?
    --> Once verification is done (i.e. Whether this amount is really coming from the React application
                                        to the backend or not) 

        Since we did not make the payment, its telling 'amount_paid: 0'.

   6] Now, if you want to make an actual payment, then you need to do verification.
      i.e. Server should validate first, that the amount details are coming from a 
           valid user/client & not some hacker.   

      If you are not a valid user (Then verification will fail).



  */

  RazorPayDetails.orders.create(option, (error, orderInfo) => {
    //if the order is not created by razorpay, then you will have an error.
    //But in case, if the order is created by razorpay successfully, those order details will be kept in orderInfo.
    if (!error) {
      // console.log(orderInfo);
      res.json({ output: orderInfo });
    } else {
      // console.log(error);
      res.status(500).send({ error });
    }
  });
});

/*
1] deleteMany({}): The empty object '{}' as the filter condition in deleteMany means that it will delete 
                   all documents in the collection.

2] The 'LocationInfo' check is removed because 'deleteMany' will work whether or not there are any 
   documents in the collection.
   
3] This ensures that every time this 'endpoint' is called, all existing documents in the 'Locations'  
   collection are deleted before new data is inserted.     

*/

//Endpoint to create TheatersAndLocations documents.
app.post("/create/locationsandtheaters", async (req, res) => {
  const locationsTheatersObj = req.body.details;

  console.log(locationsTheatersObj);

  // const LocationInfo = await LocationModel.find();

  // if (LocationInfo.length > 0) {
  //   await LocationModel.deleteMany();
  // }

  await LocationModel.deleteMany({});

  // Insert multiple documents
  const result = await LocationModel.insertMany(locationsTheatersObj);

  res.send("Data successfully inserted inside 'Locations' collection");
});

//Endpoint to update TheatersAndLocations particulat document
app.post("/update/locationsandtheaters", async (req, res) => {
  const updateData = req.body;
  console.log(updateData);

  //Perform the update
  LocationModel.updateOne(
    {
      location: updateData.location,
      theaters: {
        $elemMatch: {
          theaterName: updateData.theaterName,
          "showDates.date": updateData.date,
          "showDates.showTimes": {
            $elemMatch: {
              time: updateData.time,
            },
          },
        },
      },
    },
    {
      $set: {
        "theaters.$[theater].showDates.$[date].showTimes.$[time].rows":
          updateData.updatedRows,
      },
    },
    {
      arrayFilters: [
        { "theater.theaterName": updateData.theaterName },
        { "date.date": updateData.date },
        { "time.time": updateData.time },
      ],
    }
  )
    .then((result) => {
      console.log("Update successful:", result);
      res.send("updated successfully");
    })
    .catch((error) => {
      console.error("Error updating document:", error);
      res.send("error occured");
    });
});

//Endpoint for updating the BookingHistory.
app.post("/update/bookinghistory", async (req, res) => {
  const data = req.body;
  console.log(data);

  const fetchedBookingUser = await BookingHistoryModel.findOne({
    userEmail: data.userEmail,
  });

  if (fetchedBookingUser !== null) {
    BookingHistoryModel.updateOne(
      { userEmail: data.userEmail },
      { bookingHistoryArray: data.bookingHistoryArray }
    )
      .then((doc) => {
        res.send("Booking History Updated Successfully !!!");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  } else {
    const BookingHistoryData = new BookingHistoryModel(data);

    BookingHistoryData.save()
      .then((doc) => {
        res.send("Booking History Updated Successfully !!!");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  }
});

app.post("/get/bookinghistory", async (req, res) => {
  const userEmailInfo = req.body;
  console.log(userEmailInfo);

  const userBookingData = await BookingHistoryModel.findOne({
    userEmail: userEmailInfo.email,
  });
  res.send(userBookingData);
});

app.listen(5000, () => {
  console.log(
    "Express application is running on port no. 5000, in local server."
  );
});
