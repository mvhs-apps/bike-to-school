import React, { Component } from 'react';
import { render } from 'react-dom';
import firebase from 'firebase.js';
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

    this.handleName= this.handleName.bind(this);
    this.handleGrade= this.handleGrade.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);

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
              name,
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

  logout() {
    //This will sign out of firebase authentication and set
    //the user variable to null
    firebase.auth().signOut()
    .then(() => {
      this.setState({
        user: null
      });
    });
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
  handleName(event) {
    this.setState({ itemName : event.target.value});
  }

  handleGrade(event) {
    this.setState({ itemGrade : event.target.value});
  }
  //This is called when you hit enter
  handleSubmit(event) {
    
    //To add an item, you need to specify the key.
    //In this case, it is new unique number.  We can use the length of the student list as it is the next number in our list.
    const itemNumber = this.state.student.length;

    //Add a new key to Student Lists. It will return the new item of that key
    const studentItem = firebase.database().ref("student/" + itemNumber);
    
    //Add a value to that key
    studentItem.set(
      this.state.itemName
    );

    //update the screen, and clear out the form
    this.setState({isLoading : true, itemName: ""});

    //this will download the shopping list from firebase with the update value
    this.updateStudent();
    
    //prevent the page from reloading
    event.preventDefault();
  }
  handleEnter() {
    this.updateStudent();
  }
  handleReset() {

    //reset student list.
    //console.log("reset");
    //Get studentList from the DB and remove it
    const studentDB = firebase.database().ref("student/");
    studentDB.remove();

    //Add new student List
    const studentItem = firebase.database().ref("student/");
    const johnItem = firebase.database().ref("student/John");
    
    const items =
    {
      student : "John"
    }
    
    studentItem.set(
      items
    );

    this.setState({ isLoading: false });
    this.updateStudent();

  }

  render() {
    console.log(this.state.user);

    if(this.state.user == null){
      return (
        <div>
          Click below to Login with your Google Account <br/><br/>
          <button onClick={this.login}>Log In</button> 
          <br/>
        </div>
      );
    }
    else if (this.state.isLoading) {
      return (
        <div>
          loading...
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
          <p> Welcome to the Bike to School app! Here you can find a buddy near you to walk or bike to school with.</p>
          <button onClick={this.handleReset}>Reset List</button>
          <br/>
          <form onSubmit={this.handleSubmit}>
              Add Student:
              <input type="text" value={this.state.itemName} onChange={this.handleName} />
              Grade:
              <input type="text" value={this.state.itemGrade} onChange={this.handleGrade} />
          </form>
          <button onClick={this.handleEnter}>Enter</button>
          <br/><br/>
          Students <br/>
          { this.state.name } <br/>
          </div>
        </div>
        { this.state.studentList.map( (item) =>
            <div>
            Name: {item.otherInfo.name} <br/>
            Address: {item.otherInfo.address}<br/>
            Grade: {item.otherInfo.grade}<br/>
            Period: {item.otherInfo.firstClass}<br/>
            <br/>
            </div>
        )}
      </div>
    );
    }
  }
}



render(<App />, document.getElementById('root'));
