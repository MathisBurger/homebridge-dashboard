import {CharacteristicType, ServiceType} from '@oznu/hap-client';
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Card, CardContent, Grid, Typography} from '@mui/material';
import {Outlet, QuestionMark, Security, ToggleOn} from '@mui/icons-material';
import SecuritySystemSelect from './SecuritySystemSelect';

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
  iid: number;
  value: number|boolean|string|null;
  aid: number;
  characteristicType: string;
}

/**
 * Displays all services in a list
 *
 * @constructor
 */
const ServiceDisplay: React.FC<ServiceDisplayProps> = ({services, setServices}) => {

  const [data, setData] = useState<UpdateData|null>(null);
  const [currentSecurityState, setSecurityState] = useState<number>(0);
  const [securityDialogOpen, setSecurityDialogOpen] = useState<boolean>(false);

  const updateService = async ({iid, value, aid, characteristicType}: UpdateData) => {
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
    }
    if (type === 'SecuritySystem') {
      return <Security fontSize="large" />;
    }
    if (type === 'Switch') {
      return <ToggleOn fontSize="large" />;
    }
    return <QuestionMark fontSize="large" />;
  };

  const getStatusColor = (characteristics: CharacteristicType[]) => {
    if (characteristics.length === 0) {
      return '#919090';
    }
    if (characteristics[0].format === 'bool') {
      return characteristics[0].value === 1 ? '#fff' : '#919090';
    }
    if (characteristics[0].type === 'SecuritySystemCurrentState') {
      return characteristics[0].value !== 3 ? '#fff' : '#919090';
    }
    return '#919090';
  };

  const getServiceState = (service: ServiceType): string => {
    const characteristic = service.serviceCharacteristics.find((c) => c.canRead);
    if (characteristic?.type === 'On') {
      return characteristic?.value === 1 ? 'On' : 'Off';
    }
    if (characteristic?.type === 'SecuritySystemCurrentState') {
      switch (characteristic?.value) {
        case 0:
          return 'Home';
        case 1:
          return 'Away';
        case 2:
          return 'Night';
        case 3:
          return 'Off';
        default:
          return 'Off';
      }
    }
    return 'Off';
  };

  const onCardClick = (service: ServiceType) => {
    const characteristc = getWriteableCharacteristic(service);
    if (characteristc?.type === 'SecuritySystemTargetState') {
      setSecurityState(
          service.serviceCharacteristics.find((c) => c.type === 'SecuritySystemCurrentState')?.value as number ?? 0,
      );
      setSecurityDialogOpen(true);
      setData({
        value: null,
        aid: service.aid,
        iid: service.iid,
        characteristicType: 'SecuritySystemTargetState',
      });
      return;
    }
    setData({
      iid: service.iid,
      aid: service.aid,
      value: resolveNextValue(characteristc),
      characteristicType: characteristc?.type ?? '',
    });
  };

  useEffect(() => {
    if (data !== null) {
      updateService(data);
    }
  }, [data]);

  return (
    <>
      <Grid container direction="row" spacing={2}>
        {services.map((service: ServiceType) => (
          <Grid item xs={2}>
            <Card>
              <CardContent
                style={{backgroundColor: getStatusColor(service.serviceCharacteristics)}}
                onClick={
                  () => onCardClick(service)
                }
              >
                <Grid container direction="row" spacing={2}>
                  <Grid item xs={12}>{handleServiceIcon(service.type)}</Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">{service.serviceName}</Typography>
                  </Grid>
                  <Grid item xs={12}>{getServiceState(service)}</Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {securityDialogOpen && (
        <SecuritySystemSelect
          currentState={currentSecurityState}
          updateData={setData}
          onClose={() => setSecurityDialogOpen(false)}
          data={data}
        />
      )}
    </>
  );
};

export default ServiceDisplay;
