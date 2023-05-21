import TabContainer from '../TabContainer';
import {useEffect, useState} from 'react';
import {ServiceType} from '@oznu/hap-client';
import {io} from 'socket.io-client';
import {getUrl} from '../url';

/**
 * Page that displays all services
 *
 * @constructor
 */
const ServicePage = () => {

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
    <TabContainer services={services} setServices={setServices} />
  );
};

export default ServicePage;
