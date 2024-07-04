import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (token: string | undefined) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    //TODO Repalce with server URL
    const socketIo = io("https://synctalk.onrender.com", {
      query: { token },
    });

    //@ts-ignore
    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [token]);

  return socket;
};

export default useSocket;
