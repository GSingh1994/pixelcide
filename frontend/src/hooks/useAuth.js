import { useState, useEffect } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";

const useAuth = (socket) => {
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")));
  const axiosJWT = axios.create();

  useEffect(() => {
    // Reconnect socket if disconneceted
    if (!socket.connected && user?.sessionID) {
      socket.auth = {
        username: user.username,
        userID: user.id,
        sessionID: user.sessionID,
      };
      socket.connect();
    }
    //eslint-disable-next-line
  }, [socket]);

  const setupSocketSession = (user) => {
    socket.auth = {
      username: user.username,
      userID: user.id,
    };

    socket.connect();

    socket.on("session", ({ sessionID }) => {
      setUser((prev) => {
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            ...prev,
            sessionID,
          })
        );

        return {
          ...prev,
          sessionID,
        };
      });

      socket.auth.sessionID = sessionID;
    });
  };

  const updateUserAvatar = (avatarId) => {
    axios
      .put("https://pixelcide.herokuapp.com/users", {
        user: {
          id: user.id,
          avatar_id: avatarId,
        },
      })
      .then(() => {
        setUser((prev) => {
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              ...prev,
              avatar_id: avatarId,
            })
          );

          return {
            ...prev,
            avatar_id: avatarId,
          };
        });
      });
  };

  const verifyLogin = (username, password) => {
    if (username && password) {
      const user = { username, password };

      return axios
        .post(`https://pixelcide.herokuapp.com/login`, { user })
        .then((response) => {
          setUser(response.data);
          setupSocketSession(response.data);
          sessionStorage.setItem("user", JSON.stringify({ ...response.data }));
          return true;
        })
        .catch((err) => {
          return false;
        });
    }

    setUser(null);
    return false;
  };

  const register = (user) => {
    if (
      user.username &&
      user.name &&
      user.email &&
      user.password &&
      user.avatar_id
    ) {
      return axios
        .post(`https://pixelcide.herokuapp.com/users`, { user })
        .then((response) => {
          setUser({ ...response.data });
          setupSocketSession(response.data);
          sessionStorage.setItem("user", JSON.stringify({ ...response.data }));
          return true;
        })
        .catch((err) => {
          return false;
        });
    }
  };

  const logout = () => {
    axiosJWT
      .post(
        `https://pixelcide.herokuapp.com/logout`,
        { token: user.refreshToken },
        {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        }
      )
      .then((response) => {
        sessionStorage.removeItem("user");
        // socket.emit("logout");
        socket.disconnect();

        setUser(null);
      });
  };

  const refreshToken = () => {
    return axios.post(`https://pixelcide.herokuapp.com/refresh`, { token: user.refreshToken }).then((res) => {
      const refreshUser = {
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      };

      setUser(refreshUser);
      sessionStorage.setItem("user", JSON.stringify(refreshUser));
    });
  };

  axiosJWT.interceptors.request.use((config) => {
    const currentDate = new Date();
    const decodeToken = jwtDecode(user.accessToken);

    // If token has expired
    if (decodeToken.exp * 1000 < currentDate.getTime()) {
      refreshToken()
        .then((data) => {
          config.headers.authorization = `Bearer ${data.accessToken}`;
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    return config;
  });

  return { user, verifyLogin, logout, register, updateUserAvatar };
};

export default useAuth;
