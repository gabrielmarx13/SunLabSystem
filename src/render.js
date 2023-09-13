/*  This is the "front-end" renderer Chromium context, 
    except I'm allowing Node integration and disabling 
    context isolation and running the DB here to prevent 
    unnecessary IPC work, essentially transforming the
    back-end and front-end into one context in this app.
*/

const { ipcRenderer } = require("electron");
const { Swipe, swipeConverter } = require("./Swipe.js");
const { initializeApp } = require("firebase/app");
const firebase = require("firebase/compat/app");
require("firebase/firestore");
const { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc } = require("firebase/firestore");
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

const userQuery = async function () {
    userQueryContent = await getDocs(collection(db, "users"));

    const swipeSubmit = async function (event) {
        event.preventDefault();

        let toSubmit = true;

        const swipeBox = document.getElementById("swipe-code-area").value;
        const regex = /^%A\d{9}.*$/;
        var possibleId = "";
        var possiblePermission = "";
        if (regex.test(swipeBox)) {
            possibleId = swipeBox.match(regex)[0].substring(2, 11)
            let trueId = false;
            userQueryContent.forEach((doc) => {
                if (doc.data().id == possibleId) {
                    possiblePermission = doc.data().permission;

                    switch (doc.data().status) {
                        case "activated":
                            trueId = true;
                            break;
                        case "reactivated":
                            trueId = true;
                            break;
                        case "suspended":
                            alert("You are currently suspended from the SUN Lab.")
                            break;
                        default:
                            alert("Something went wrong. Please try again.")
                    }
                }
            })
            if (!trueId) {
                alert("Invalid ID: Your ID does not match any record in our system.")
                toSubmit = false;
            }
        } else {
            alert("Invalid Input: The format of your card swipe was invalid. Please try again.")
            toSubmit = false;
        }

        const radios = document.getElementsByName("in-out");
        let selectedOption = "";
        for (let option of radios) {
            if (option.checked) {
                selectedOption = option.id;
            }
        }
        if (selectedOption == "") {
            alert("Please select a swipe option.")
            toSubmit = false;
        }

        if (toSubmit) {
            if (selectedOption != "admin") {
                await addDoc(collection(db, "swipes"), swipeConverter.toFirestore(new Swipe(possibleId, selectedOption, Date.now())))
            }

            if (possiblePermission == "authorized-person" && selectedOption == "admin") {
                document.getElementById("swipe-menu").style.display = "none";
                document.getElementById("filter-div").style.display = "inline";
                swipeQuery();
            } else if (possiblePermission == "all" && selectedOption == "admin") {
                document.getElementById("swipe-menu").style.display = "none";
                document.getElementById("filter-div").style.display = "inline";
                swipeQuery();
                userHydrate();
            }
            
            if (selectedOption == "admin") {
                alert("Welcome to the administrator tools.")
            } else {
                alert(`Successfully swiped ${selectedOption}`)
            }
        }

        // See existical's fix for this active Electron issue https://github.com/electron/electron/issues/31917#issuecomment-1061142818
        ipcRenderer.send("focus-fix");
    }
    document.getElementById("swipe-form").addEventListener("submit", swipeSubmit);

    const userHydrate = () => {
        document.getElementById("student-list-title").textContent = "ID List";
        userQueryContent.forEach((d) => {
            let liToAppend = document.createElement("li");
            liToAppend.id = "student-flexbox";

            let nameDiv = document.createElement("div");
            nameDiv.id = "name-div";
            nameDiv.textContent = `${d.data().name}`;
            liToAppend.appendChild(nameDiv);

            let idDiv = document.createElement("div");
            idDiv.id = "id-div";
            idDiv.textContent = `${d.data().id}`;
            liToAppend.appendChild(idDiv);

            let permissionDiv = document.createElement("div");
            permissionDiv.id = "permission-div";
            permissionDiv.textContent = `${d.data().permission}`;
            liToAppend.appendChild(permissionDiv);


            let button = document.createElement("input");
            button.type = "button";

            const docRef = doc(db, "users", d.id)

            const suspend = async () => {
                button.removeEventListener("click", suspend);
                button.addEventListener("click", reactivate);
                button.value = "Reactivate";
                await updateDoc(docRef, {
                    status: "suspended"
                });
            }

            const activate = async () => {
                button.removeEventListener("click", activate);
                button.addEventListener("click", suspend);
                button.value = "Suspend";
                await updateDoc(docRef, {
                    status: "activated"
                });
            }

            const reactivate = async () => {
                button.removeEventListener("click", reactivate);
                button.addEventListener("click", suspend)
                button.value = "Suspend";
                await updateDoc(docRef, {
                    status: "reactivated"
                });
            }

            switch (d.data().status) {
                case "unactivated":
                    button.value = "Activate"
                    button.addEventListener("click", activate);
                    break;
                case "activated":
                    button.value = "Suspend"
                    button.addEventListener("click", suspend);
                    break;
                case "suspended":
                    button.value = "Reactivate"
                    button.addEventListener("click", reactivate);
                    break;
                case "reactivated":
                    button.value = "Suspend"
                    button.addEventListener("click", suspend);
                    break;
                default:
                    button.value = "Error"
                    break;
            }

            liToAppend.appendChild(button);
            document.getElementById("student-list").appendChild(liToAppend);
        })
    };
}

const swipeQuery = async function () {
    swipeQueryContent = await getDocs(collection(db, "swipes"));

    const swipeHydrate = () => {
        document.getElementById("swipe-list-title").textContent = "Swipe List";
        swipeQueryContent.forEach(async (d) => {

            const docRef = doc(db, "swipes", d.id)
            if (d.data().timestamp + 157788000000 < Date.now()) {
                await deleteDoc(docRef)
            } else {
                let liToAppend = document.createElement("li");
                liToAppend.id = "swipe-flexbox";
    
                let idDiv = document.createElement("div");
                idDiv.id = "id-div";
                idDiv.textContent = `${d.data().id}`;
                liToAppend.appendChild(idDiv);
    
                let inOutDiv = document.createElement("div");
                inOutDiv.id = "inOut-div";
                inOutDiv.textContent = `${d.data().inOut}`;
                liToAppend.appendChild(inOutDiv);
    
                let timestampDiv = document.createElement("div");
                timestampDiv.id = "timestamp-div";
    
                const dateObject = new Date(d.data().timestamp);
                const year = dateObject.getFullYear();
                const month = dateObject.getMonth() + 1;
                const day = dateObject.getDate();
                const hours = dateObject.getHours();
                const minutes = dateObject.getMinutes();
                const seconds = dateObject.getSeconds();
    
                timestampDiv.textContent = `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day} ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
                liToAppend.appendChild(timestampDiv);
    
                document.getElementById("swipe-list").appendChild(liToAppend);
            }
        })
    };

    swipeHydrate();
}

userQuery();

const filterSubmit = async function (event) {
    event.preventDefault();

    const id = document.getElementById("filter-id").value;
    const startDate = document.getElementById("filter-date-start").value;
    const endDate = document.getElementById("filter-date-end").value;
    const startTime = document.getElementById("filter-time-start").value;
    const endTime = document.getElementById("filter-time-end").value;

    console.log(`${id} ${startDate} ${endDate} ${startTime} ${endTime}`)

    const idList = document.getElementById("student-list").children;
    for (const child of idList) {
        if (child.querySelector("#id-div").textContent != id) {
            child.style.display = "none";
        } else {
            child.style.display = "flex"
        }
    }
    const swipeList = document.getElementById("swipe-list").children;
    for (const child of swipeList) {
        if (child.querySelector("#id-div").textContent != id) {
            child.style.display = "none";
        } else {
            child.style.display = "flex"
        }
    }
};
document.getElementById("filter-form").addEventListener("submit", filterSubmit);