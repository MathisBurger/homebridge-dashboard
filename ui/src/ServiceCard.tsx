import {CharacteristicType, ServiceType} from '@oznu/hap-client';
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Card, CardActions, CardContent, Grid, IconButton, Menu, MenuItem, Typography} from '@mui/material';
import {Outlet, QuestionMark, Security, Settings, ToggleOn} from '@mui/icons-material';
import {getProtocol, getUrl} from './url';
import {UpdateData} from './ServiceDisplay';
import SecuritySystemSelect from './SecuritySystemSelect';
import {useSnackbar} from 'mui-wrapped-components';
import {useCopyToClipboard} from "usehooks-ts";

interface ServiceCardProps {
    service: ServiceType;
    setServices: Dispatch<SetStateAction<ServiceType[]>>;
}

const ServiceCard: React.FC<ServiceCardProps> = ({service, setServices}) => {

  const [data, setData] = useState<UpdateData|null>(null);
  const [currentSecurityState, setSecurityState] = useState<number>(0);
  const [securityDialogOpen, setSecurityDialogOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {openSnackbar} = useSnackbar();
  const menuOpen = Boolean(anchorEl);
  const [value, copy] = useCopyToClipboard();

  const updateService = async ({value, uniqueId, characteristicType}: UpdateData) => {
    if (value === null) {
      return null;
    }
    const response = await fetch(`${getProtocol()}//${getUrl()}/updateService`, {
      method: 'POST',
      body: JSON.stringify({
        value,
        uniqueId,
        characteristicType,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const js = await response.json();
    setServices(js['services']);
  };

  useEffect(() => {
    if (data !== null) {
      updateService(data);
    }
  }, [data]);

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
        uniqueId: service.uniqueId,
        characteristicType: 'SecuritySystemTargetState',
      });
      return;
    }
    setData({
      uniqueId: service.uniqueId,
      value: resolveNextValue(characteristc),
      characteristicType: characteristc?.type ?? '',
    });
  };

  const copyUniqueId = async () => {
    await copy(service.uniqueId ?? 'invalid-id');
    setAnchorEl(null);
    openSnackbar('success', `Successfully copied ${value} to clipboard`, 1000);
  };

  return (
    <>
      <Card style={{width: '100%'}}>
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
        <CardActions style={{backgroundColor: getStatusColor(service.serviceCharacteristics), padding: 0}} disableSpacing>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Settings />
          </IconButton>
        </CardActions>
      </Card>
      {securityDialogOpen && (
        <SecuritySystemSelect
          currentState={currentSecurityState}
          updateData={setData}
          onClose={() => setSecurityDialogOpen(false)}
          data={data}
        />
      )}
      {menuOpen && (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={copyUniqueId}>Copy uniqueId</MenuItem>
        </Menu>
      )}
    </>
  );
};

export default ServiceCard;
