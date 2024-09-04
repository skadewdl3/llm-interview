import { useState, useEffect } from 'react';

export default function useMediaDevices(): [MediaDeviceInfo[], () => void] {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error('Error getting media devices:', error);
    }
  };

  useEffect(() => {
    getDevices();
    navigator.mediaDevices.addEventListener('devicechange', () => getDevices());
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', () => getDevices());
    };
  }, []);


  return [devices, getDevices];
}
