import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      auth: { token: localStorage.getItem('token') },
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const joinRideRoom = (rideId) => {
    socketRef.current?.emit('join_ride_room', rideId);
  };

  const sendMessage = (data) => {
    socketRef.current?.emit('send_message', data);
  };

  const sendLocation = (data) => {
    socketRef.current?.emit('location_update', data);
  };

  const onMessage = (callback) => {
    socketRef.current?.on('receive_message', callback);
    return () => socketRef.current?.off('receive_message', callback);
  };

  const onLocation = (callback) => {
    socketRef.current?.on('location_update', callback);
    return () => socketRef.current?.off('location_update', callback);
  };

  return (
    <SocketContext.Provider value={{ connected, joinRideRoom, sendMessage, sendLocation, onMessage, onLocation, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
