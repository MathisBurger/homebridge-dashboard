import {ServiceType} from '@oznu/hap-client';
import React, {Dispatch, SetStateAction} from 'react';
import {Grid} from '@mui/material';
import ServiceCard from "./ServiceCard";

interface ServiceDisplayProps {
  /**
   * All services
   */
  services: ServiceType[];
  /**
   * Function to set all services
   */
  setServices: Dispatch<SetStateAction<ServiceType[]>>;
}

/**
 * The data that is required for updates
 */
export interface UpdateData {
  uniqueId: ServiceType['uniqueId'];
  value: number|boolean|string|null;
  characteristicType: string;
}

/**
 * Displays all services in a list
 *
 * @constructor
 */
const ServiceDisplay: React.FC<ServiceDisplayProps> = ({services, setServices}) => {

  return (
    <>
      <Grid container direction="row" spacing={2}>
        {services.map((service: ServiceType) => (
          <Grid item xs={2}>
            <ServiceCard service={service} setServices={setServices} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default ServiceDisplay;
