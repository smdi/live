
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({ port: 8887 });

var users = {};


wss.on('listening',function (listening)
{
console.log("Server Started........");
});

wss.on('connection', function (connection) {

 console.log("User connected");


 connection.on('close',function(close)
{
   
    if(connection.name)
    {
     delete users[connection.name];
    }
    if(connection.otherName)
    {
    	console.log("Disconnecting from the User :", connection.otherName);
    	var conn = users[connection.otherName];

    	connection.otherName = null;

    	if(conn!=null)
    	{
            sendTo(conn ,{type:"leave"})
    	}

    }

 });

 connection.on('message', function (message) {
  
   var data;

   try
   {
    data = JSON.parse(message);
   }catch(err)
   {
    console.log(err);
    data = {};
   }
  
  switch(data.type)
  {
   
    case "login":

    console.log("User has Logged in as ",data.name);

 if(users[data.name])
 {
    sendTo(connection ,{type:"login",success:false});
 }
else{
 
  users[data.name] = connection;
  connection.name  = data.name;
  sendTo(connection ,{type:"login",success:true});
}

break;

 case "offer":
 
   console.log("sending offer to ",data.name) 
   var conn = users[data.name];
   if(conn!=null)
   {
    connection.otherName = data.name;
    sendTo(conn,{type : "offer",offer :data.offer,name:connection.name});
   }

 break;

 case "answer":

   console.log("Answering the offer ",data.name);
   var conn  = users[data.name];
   if(conn!=null)
   {
       connection.otherName = data.name;
       sendTo(conn,{type : "answer",answer : data.answer ,name :connection.name});
   }

   break;

case "candidate":
 
  console.log("Sending data to :",data.name);
  var conn = users[data.name];
  if(conn!=null)
  {
     connection.otherName = data.name;
     sendTo(conn,{type : "candidate" ,candidate : data.candidate});
  }

break;

case "leave":

 console.log("Disconnecting from user :",data.name);
 var conn = users[data.name];
 if(conn!=null)
 {
   connection.otherName = null;
   sendTo(conn,{type : "leave"})
 }

break;

default :
     sendTo(connection ,{type:"error",message:"Unrecognized Command  " + data.type })
break;

  }

 console.log("Got message:", message);
 });
 //connection.send("hello world");
});

function sendTo(connection ,message)
{

   connection.send(JSON.stringify(message));
}
