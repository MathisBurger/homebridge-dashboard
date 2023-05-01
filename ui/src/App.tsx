import {useEffect, useState} from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import {io} from 'socket.io-client';
import ServiceDisplay from './ServiceDisplay';
import {ServiceType} from '@oznu/hap-client';

function App() {
  const [services, setServices] = useState<ServiceType[]>([]);

  useEffect(() => {
    const socket = io('ws://localhost:18081');
    socket.on('connect', () => {
      console.log('connected');
    });
    socket.on('state-changed', (data: {data: ServiceType[]}) => {
      setServices(data['data']);
    });
  }, []);

  return (
    <>
      <ServiceDisplay services={services} setServices={setServices} />
    </>
  );
}

export default App;
