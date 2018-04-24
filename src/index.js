import React, { Component } from 'react';
import { render } from 'react-dom';
import firebase from './firebase.js';
import './style.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      student: [],
      isLoading: true,
      studentList: [],
      user: null
    };

    
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitAdd = this.handleSubmitAdd.bind(this);
    this.handleChangeAdd= this.handleChangeAdd.bind(this);
    this.clear = this.clear.bind(this);
    this.login = this.login.bind(this);
    this.handleFirstName= this.handleFirstName.bind(this);
    this.handleLastName= this.handleLastName.bind(this);
    this.handleID= this.handleID.bind(this);

  }

  componentDidMount() {
    

    //when you hit reload, this will check if you already logged in
    //and will set the user variable accordingly.
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user:user });
      } 
      
      this.setState({ loading: false });
    });

    firebase.auth().getRedirectResult().then( function (result){
      // This gives you a Google Access Token. You can use it to access the Google API.
      const token = result.credential.accessToken;
      // The signed-in user info.
      const user = result.user;

      //Set the state user variable
      this.setState({ user });
      // ...
      }).catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        const credential = error.credential;
        // ...
        
    });
  }
  componentWillMount() {
        
    console.log("Connecting to firebase");

    //allow your app to sign in anonomously
    firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });

    this.updateStudent();

    //Get the student List table of firebase
    const studentsDB = firebase.database().ref("student");
    
    const tempstudent = [];
    const tempStudentList = [];
    studentsDB.on('value',snapshot => {
      //Read each item in students
      //Store it in a temporary array
      snapshot.forEach(childSnapShot => {
        //childSnapShot.key is the name of the data
        //console.log(childSnapShot.key + "" childSnapShot.val() );
        //childSnapShot.val() is the value of the data
        const studentInfo = {
          otherInfo: [],
        }
        studentInfo.name = childSnapShot.key;
        studentInfo.otherInfo = childSnapShot.val();

        tempStudentList.push(studentInfo);
        tempstudent.push(childSnapShot.val());
        
      });

      this.setState({student: tempstudent, studentList: tempStudentList, isLoading: false });
      
    });
}
  login(){
    //console.log("sign-in");
    //This code will setup the Google login page
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }

  
  
  updateStudent() {

    //The following code get a particular table
    const studentDB = firebase.database().ref("Student");
    
    //Store content of the database into an array to be used
    //to set the state later.
    const studentTemp = [];

    //Get studentList from the DB and add it to the local list.
    studentDB.on('value', snapshot => {
      
      snapshot.forEach(childSnapShot => {
        console.log( childSnapShot.key + " : "  + childSnapShot.val());
  
        const item = 
        {
            number: childSnapShot.key,
            name: childSnapShot.val()
        }

        //Add an item object to the studentListTemp Array
        studentTemp.push(item);
        

      });

      //set the studentLTemp Array to the state shoppingList, and load to false
      this.setState({ student: studentTemp, isLoading: false });
        
    });
  }

  //This is called when your type something
  handleFirstName(event) {
    this.setState({ FirstName : event.target.value});
  }

  handleLastName(event) {
    this.setState({ LastName : event.target.value});
  }

  handleID(event) {
    this.setState({ ID : event.target.value});
  }
  //This is called when you hit enter
  handleSubmit(event) {
    

    //To add an item, you need to specify the key.
    //In this case, it is new unique number.  We can use the length of the Student list as it is the next number in our list.
    const itemNumber = this.state.studentList.length;

    //Add a new key to Student Lists. It will return the new item of that key
    const StudentListDB = firebase.database().ref("Student List/" + itemNumber);

    //This has to match your firebase database
    const aStudent = {
        FirstName : this.state.FirstName,
        LastName : this.state.LastName,
        ID : this.state.ID
    }
    
    
    //Add a value to the new student to firebase
    StudentListDB.set(
      aStudent
    );

    //update the screen, and clear out the form
    this.setState({
      isLoading : true, 
      FirstName: "", 
      LastName: "",
      ID: ""
    });

    //this will download the Student list from firebase with the update value
    this.updateStudentList();
    
    //prevent the page from reloading
    event.preventDefault();
  }
  updateStudentList() {

    //The following code get a particular table
    const studentListDB = firebase.database().ref("Student List");
    
    //Store content of the database into an array to be used
    //to set the state later.
    const studentListTemp = [];

    //Get StudentList from the DB and add it to the local list.
    studentListDB.on('value', snapshot => {
      
      snapshot.forEach(childSnapShot => {
        //console.log( childSnapShot.key + " : "  + childSnapShot.val());
  
        const aStudent = {
            FirstName : childSnapShot.val().FirstName,
            LastName : childSnapShot.val().LastName,
            ID : childSnapShot.val().ID
        }

        //Add an item object to the StudentListTemp Array
        studentListTemp.push(aStudent);
        

      });

      //set the StudentLItemTemp Array to the state StudentList, and load to false
      this.setState({ studentList: studentListTemp, isLoading: false });
        
    });
  }
  handleSubmitAdd(event) {
    //console.log("adding list ");
    if( this.state.user != null ){
      //This is will reference all the information under Shopping List
      //All user data will be stored under shopping list.
      //Each item will be tied in with the email of the user.
      const studentItem = firebase.database().ref("student/");

      //Create an object to store the item information
      //The item information should contain the name of the item
      //and the email of the user.  The email is used to identify that
      //item belongs to the user.
      const item = {
        itemName: this.state.itemName,
        userEmail: this.state.user.email
      }

      //Push the item object to the database
      studentItem.push(item);
    }

    //update list
    this.updateStudent();

    //reset item name
    this.setState({itemName: ""});

    //prevent the page from reloading
    event.preventDefault();
  }
  clear(){
    //console.log("clearing");

    //Go through the shopping list in the state using a for each loop
    for( const each of this.state.student ){
      //console.log(each.id);
      //Get key of the each item and reference it in the firebase database
      const itemRef = firebase.database().ref("/student/"+each.key);
      //remove it from the firebase
      itemRef.remove();
    }

    //update list
    this.updateStudent();
  }

  handleChangeAdd(event) {
    this.setState({ itemName : event.target.value});
    //console.log("update list");
    //this.updateList();
  }
  render() {
    console.log(this.state.user);

    if (this.state.isLoading) {
      return (
        <div>
          loading...
        </div>
      );
    } 
    else if(this.state.user == null){
      return (
        <div>
          Click below to Login with your Google Account <br/><br/>
          <button onClick={this.login}>Log In</button> 
          <br/>
        </div>
      );
    }
    
    else {
      console.log("User: " + this.state.user);
      
      return (
      <div>
      <div id="header">
        Bike To School
        <div id="main">
          <button onClick={this.logout}>Log Out</button>
          <br/><br/>
          Hello {this.state.user.displayName}, you are logged in!
          <br/>
          <p> Welcome to the Bike to School app! Here you can find a buddy near you to walk or bike to school with.</p>
         
          <br/>
          <form onSubmit={this.handleSubmit}>

              First Name: <input type="text" value={this.state.FirstName} onChange={this.handleFirstName} /><br/>
              Last Name: <input type="text" value={this.state.LastName} onChange={this.handleLastName} /><br/>
              5 Digit Student ID: <input type="text" value={this.state.ID} onChange={this.handleID} /><br/>

              <button type="submit" value="Submit">Submit</button>
          </form>  
          <br />
          <button onClick={this.handleEnter}>Enter</button>
          <br/><br/>
          </div>
        </div>
      </div>
    );
    }
  }
}



render(<App />, document.getElementById('root'));
