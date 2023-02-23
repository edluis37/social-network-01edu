import React, { useState, useEffect, StrictMode, useRef } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, json } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NavBar from "./components/Navbar";
import Profile from "./pages/Profile";
import PublicProfiles from "./pages/PublicProfiles";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { useDispatch } from "react-redux";

// Define a reducer function that updates the follower count for a specific user
function followerCountsReducer(state = {}, action) {
  switch (action.type) {
    case "UPDATE_FOLLOWER_COUNT":
      return {
        ...state,
        [action.payload.userEmail]: action.payload.count,
      };
    default:
      return state;
  }
}

// Create a Redux store that uses the followerCountReducer
const store = createStore(followerCountsReducer);

const root = ReactDOM.createRoot(document.querySelector("#app"));

function App() {
  // Current user state vars.
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [valid, setValid] = useState(false);

  // can probably merge with existing wSocket handler
  const websocket = useRef(null);

  const openConnection = (ws) => {
    if (websocket.current === null) {
      console.log("open connection...");
      websocket.current = ws;
    }
  };

  const closeConnection = () => {
    if (websocket.current !== null) {
      websocket.current.close(1000, "user refreshed or logged out.");
      websocket.current = null;
      setValid(false);
    }
  };

  // store current user
  const [user, setUser] = useState({});

  // Variable to handle incoming WebSocket messages with the new follower count and update the UI.
  // ("global" follower count.)
  const [followerCounts, setFollowerCounts] = useState({});

  // Websocket
  const [wSocket, setWSocket] = useState(null);

  // All users state vars
  const [users, setUsers] = useState([]);

  useEffect(() => {
    window.addEventListener("beforeunload", closeConnection);
    return () => {
      window.removeEventListener("beforeunload", closeConnection);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // validate user based on session.
      const response = await fetch("http://localhost:8080/api/user", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const content = await response.json(); //getting current user.

      // Set user details
      setName(content.first);
      setAvatar(content.avatar);

      const user = {
        email: content.email,
        last: content.last,
        dob: content.dob,
        nickname: content.nickname,
        aboutme: content.about,
        followers: followerCounts[content.email]
          ? followerCounts[content.email]
          : content.followers,
        following: content.following,
      };

      setUser(user);
      // try to connect to websocket.
      handleWSocket(user);

      if (user.nickname !== undefined) {
        setValid(true);
      }
    };
    fetchData().then(() => {});
  }, [followerCounts, name]);

  // must be in body of component
  const dispatch = useDispatch();

  const handleWSocket = (usr) => {
    if (wSocket === null) {
      // Connect websocket after logging in.
      const newSocket = new WebSocket("ws://" + document.location.host + "/ws");
      newSocket.onopen = () => {
        console.log("WebSocket connection opened");
      };

      newSocket.onmessage = (event) => {
        let msg = JSON.parse(event.data);


        if (msg.toFollow === usr.email) {
          /*
          // send notification sounds.
          try {
            const notifSound = new Audio(
              "public/assets/sounds/notification.mp3"
              );
              notifSound.play();
            } catch (error) {}
            */
          // Send message to relevant user according to isFollowing true or false.
          if (msg.isFollowing) {
            dispatch({
              type: "UPDATE_FOLLOWER_COUNT",
              payload: {
                userEmail: msg.toFollow,
                count: usr.followers + 1,
              },
            });
            // setFollowerCounts({
            //   ...followerCounts,
            //   [usr.email]: msg.followers + 1,
            // });
            alert(msg.followRequest + " started following you, legend!");
          } else {
            dispatch({
              type: "UPDATE_FOLLOWER_COUNT",
              payload: {
                userEmail: msg.toFollow,
                count: usr.followers,
              },
            });
            // setFollowerCounts({
            //   ...followerCounts,
            //   [usr.email]: msg.followers,
            // });
            alert(msg.followRequest + " unfollowed you, loser.");
          }
        } else if (msg.followRequest === usr.email) {
          
        }
      };

      setWSocket(newSocket);
    }
  };

  useEffect(() => {
    (async () => {
      // Fetch users from "all users" api
      const usersPromise = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const usersJson = await usersPromise.json(); //getting current user.
      setUsers(usersJson);
    })();
  }, []);

  return (
    // <StrictMode>
    <BrowserRouter>
      <NavBar name={name} setName={setName} closeConn={closeConnection} />
      <Routes>
        <Route
          index
          element={
            <Home
              name={name}
              avatar={avatar}
              user={user}
              followerCounts={followerCounts}
              setFollowerCounts={setFollowerCounts}
            />
          }
        />
        <Route
          path="/login"
          element={<Login setName={setName} openConn={openConnection} />}
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile/"
          element={
            <Profile
              name={name}
              avatar={avatar}
              user={user}
              followerCounts={followerCounts}
              setFollowerCounts={setFollowerCounts}
              dispatch={dispatch}
            />
          }
        />
        <Route
          path="/public-profiles"
          element={
            <PublicProfiles
              users={users}
              socket={wSocket}
              user={user}
              followerCounts={followerCounts}
              setFollowerCounts={setFollowerCounts}
              dispatch={dispatch}
            />
          }
        />
      </Routes>
    </BrowserRouter>
    // </StrictMode>
  );
}

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
