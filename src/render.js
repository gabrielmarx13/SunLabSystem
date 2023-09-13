/*  This is the "front-end" renderer Chromium context, 
    except I'm allowing Node integration and disabling 
    context isolation and running the DB here to prevent 
    unnecessary IPC work, essentially transforming the
    back-end and front-end into one context in this app.
*/

const { initializeApp } = require("firebase/app");
const firebase = require("firebase/compat/app");
require("firebase/firestore");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const firebaseConfig = {
    apiKey: "AIzaSyBQtMyWCq6Q41YKyaYm7DGMNbLFFqo8qFI",
    authDomain: "sunlabsystem-432d8.firebaseapp.com",
    projectId: "sunlabsystem-432d8",
    storageBucket: "sunlabsystem-432d8.appspot.com",
    messagingSenderId: "294530711335",
    appId: "1:294530711335:web:fad79ca64886a3dddbb302"
};
const fbapp = initializeApp(firebaseConfig);
const db = getFirestore(fbapp);

const query = async function () {
    userQuery = await getDocs(collection(db, "users"));
    userQuery.forEach((d) => document.getElementById("userlist").textContent = `${d.id} ${d.data().id} ${d.data().permission} ${d.data().status}`);
}

query();