import {useEffect, useState} from 'react';
import './App.css';
import {io} from 'socket.io-client';
import {ServiceType} from '@oznu/hap-client';
import {getUrl} from './url';
import {SnackbarProvider} from 'mui-wrapped-components';
import TabContainer from './TabContainer';

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
    <SnackbarProvider>
      <TabContainer services={services} setServices={setServices} />
    </SnackbarProvider>
  );
}

export default App;
