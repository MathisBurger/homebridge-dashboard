import {useEffect, useState} from 'react';
import './App.css';
import {io} from 'socket.io-client';
import ServiceDisplay from './ServiceDisplay';
import {ServiceType} from '@oznu/hap-client';
import {getUrl} from "./url";

function App() {
  const [services, setServices] = useState<ServiceType[]>([]);

  /**
   * Connects to socket and updates all changes.
   */
  useEffect(() => {
    const socket = io(`ws://${getUrl()}`);
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
