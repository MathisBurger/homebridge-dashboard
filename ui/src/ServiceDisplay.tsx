import {CharacteristicType, ServiceType} from '@oznu/hap-client';
import React, {Dispatch, SetStateAction} from 'react';
import {Card, CardContent, Grid} from '@mui/material';
import {Outlet, QuestionMark} from '@mui/icons-material';

interface ServiceDisplayProps {
    services: ServiceType[];
    setServices: Dispatch<SetStateAction<ServiceType>[]>;
}

const ServiceDisplay: React.FC<ServiceDisplayProps> = ({services, setServices}) => {

  const updateService = async (iid: number, value: number|string|boolean|null, aid: number, characteristicType: string) => {
    if (value === null) {
      return null;
    }
    const response = await fetch('http://localhost:18081/updateService', {
      method: 'POST',
      body: JSON.stringify({
        iid,
        value,
        aid,
        characteristicType,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const js = await response.json();
    setServices(js['services']);
  };

  const resolveNextValue = (characteristic: CharacteristicType|undefined) => {
    if (characteristic === undefined) {
      return null;
    }
    const value = characteristic.value;
    if (typeof value === 'boolean') {
      return !value;
    }
    if (typeof value === 'number') {
      if (characteristic.minValue === 0 && characteristic.maxValue === 1) {
        return value === 0 ? 1 : 0;
      }
      // Select value
      return value+1;
    }
    return value;
  };

  const getWriteableCharacteristic = (service: ServiceType): CharacteristicType|undefined => {
    return service.serviceCharacteristics.find((c) => c.canWrite);
  };

  const handleServiceIcon = (type: string) => {
    if (type === 'Outlet') {
      return <Outlet fontSize="large" />;
    } else {
      return <QuestionMark fontSize="large" />;
    }
  };

  const getStatusColor = (characteristics: any[]) => {
    if (characteristics.length === 0) {
      return '#919090';
    }
    if (characteristics[0].format === 'bool') {
      return characteristics[0].value === 1 ? '#fff' : '#919090';
    } else {
      return '#919090';
    }
  };

  return (
    <Grid container direction="row" spacing={2}>
      {services.map((service: ServiceType) => (
        <Grid item xs={2}>
          <Card>
            <CardContent
              style={{backgroundColor: getStatusColor(service.serviceCharacteristics ?? [])}}
              onClick={
                () => {
                  const characteristc = getWriteableCharacteristic(service);
                  updateService(
                    service.iid,
                    resolveNextValue(characteristc),
                    service.aid,
                    characteristc?.type ?? '',
                  );
                }
              }
            >
              <Grid container direction="row" spacing={2}>
                <Grid item xs={12}>{handleServiceIcon(service.type)}</Grid>
                <Grid item xs={12}>{service.serviceName}</Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ServiceDisplay;
