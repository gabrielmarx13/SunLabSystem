import { initializeApp } from ("firebase/app");
import firebase from "firebase/compat/app"
import "firebase/firestore";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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


export default async function query() {
    const userQuery = await getDocs(collection(db, "users"));
    userQuery.forEach((doc) => document.getElementById("userlist").append(`${doc.id} => ${doc.data()}`))
}