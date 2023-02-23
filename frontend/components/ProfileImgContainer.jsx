import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

// Component that contains image, followers etc.
export default function ProfileImgContainer(props) {
  // Check if we are at other user's profile. If so, show follow button instead of my profile button.
  const otherUser = window.location.href.split("/").at(-1);

  // Variable to check following status. Set to true if user presses follow or on refreshing the page.
  const [isFollowing, setIsFollowing] = useState(false);

  // const followerCount = props.user.followers;

  // const [followerCount0, setFollowerCount0] = useState(props.user.followers);

  let followerCount =
    useSelector((state) => state[props.user.email]) || props.user.followers;

  // const followingCount = useSelector((state) => state[props.user.email]);
  // console.log(followingCount);

  // Send a request on refresh to check if the current user is already following user rendered on this component.

  // Get all the followers of the user rendered on component.
  useEffect(() => {
    (async () => {
      const response = await fetch("http://localhost:8080/api/followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          follower: props.currentUser ? props.currentUser.email : null,
          followee: props.user.email,
        }),
      });

      let result = await response.json();

      // if (result === null) {
      // } else {
      //   setIsFollowing(true);
      // }
      // The above is the same as:
      setIsFollowing(result !== null);
    })();
  }, []);

  // Follow button handler
  const followHandler = (ev) => {
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);

    // Update follower count on the follower's browser.
    // Update follower count on the follower's browser.
    const count = followerCount + (newIsFollowing ? 1 : -1);
    console.log(props);
    props.dispatch({
      type: "UPDATE_FOLLOWER_COUNT",
      payload: {
        userEmail: props.user.email,
        count,
      },
    });

    const follow = JSON.stringify({
      followRequest: props.currentUser.email,
      toFollow: props.user.email,
      isFollowing: newIsFollowing,
      followers: props.user.followers,
    });
    // Send follow request through the backend.
    props.socket.send(follow);
  };

  // Comment for gitea

  return (
    <div className="profileImgContainer">
      {props.name ? (
        <div className="profileImgParent">
          {props.avatar ? (
            <img
              className="profileImg"
              src={props.avatar}
              alt={props.user.name + "'s profile image"}
            />
          ) : (
            <img
              className="profileImg"
              src="https://www.transparentpng.com/thumb/user/gray-user-profile-icon-png-fP8Q1P.png"
              alt="No Image"
            />
          )}
          <span className="firstLast">
            {props.name} {props.user.last}
          </span>
          <p className="aboutme">{props.user.aboutme}</p>
          <hr className="break" />

          <div className="followerDiv">
            <div>
              <span className="followerFollowing">Following</span>
            </div>
            <div>
              <span className="count" id="following">
                {props.user.following}
              </span>
            </div>
          </div>
          <hr className="break" />

          <div className="followerDiv">
            <div>
              <span className="followerFollowing">Followers</span>
            </div>
            <div>
              <span className="count" id={`${props.user.email}-followers`}>
                testing: {followerCount}
              </span>
            </div>
          </div>
          <hr className="break" />
          <div className="followerDiv">
            {otherUser ? (
              <span>
                <button
                  className="redText"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                  onClick={followHandler}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </span>
            ) : (
              <Link
                to="/profile"
                style={{ textDecoration: "none", marginBottom: "15px" }}
              >
                <span className="redText">My Profile</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div> loading... </div>
      )}
    </div>
  );
}
