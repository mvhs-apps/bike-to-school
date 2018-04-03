import firebase from 'firebase'
  var config = {
    apiKey: "AIzaSyC4NzQwWGB2_6P3c7uHS3K0WXM7CJWLeZE",
    authDomain: "biketoschoolmvcs.firebaseapp.com",
    databaseURL: "https://biketoschoolmvcs.firebaseio.com",
    projectId: "biketoschoolmvcs",
    storageBucket: "biketoschoolmvcs.appspot.com",
    messagingSenderId: "490087351477"
  };
  firebase.initializeApp(config);
  export default firebase;