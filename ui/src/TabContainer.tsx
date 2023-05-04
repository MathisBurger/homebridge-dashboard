import {Box, Tab, Tabs} from '@mui/material';
import React, {Dispatch, SetStateAction, SyntheticEvent, useEffect, useMemo, useState} from 'react';
import {ServiceType} from '@oznu/hap-client';
import ServiceDisplay from './ServiceDisplay';
import {getProtocol, getUrl} from './url';

interface TabContainerProps {
    services: ServiceType[];
    setServices: Dispatch<SetStateAction<ServiceType[]>>;
}

interface TabType {
    name: string;
    devices: string[];
}

const TabContainer: React.FC<TabContainerProps> = ({services, setServices}) => {

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [tabs, setTabs] = useState<TabType[]>([]);

  useEffect(() => {
    fetch(`${getProtocol()}//${getUrl()}/tabConfiguration`)
      .then((res) => res.json())
      .then((allTabs) => setTabs(allTabs['tabs']));
  }, []);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
      'style': {color: 'white'},
    };
  };

  const filteredServices = useMemo<ServiceType[]>(
    () => {
      if (currentTab === 0) {
        return services;
      }
      const index = currentTab-1;
      const tab = tabs[index];
      return services.filter((s) => tab.devices.indexOf(s.uniqueId ?? '') > -1);
    },
    [currentTab, services, tabs],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Default" {...a11yProps(0)} />
          {tabs.map((tab, i) => (
            <Tab label={tab.name} {...a11yProps(i+1)} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{marginTop: '20px', width: '100%'}}>
        <ServiceDisplay services={filteredServices} setServices={setServices} />
      </Box>
    </Box>
  );
};

export default TabContainer;
