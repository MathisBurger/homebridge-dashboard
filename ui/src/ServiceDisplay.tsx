import {ServiceType} from '@oznu/hap-client';
import React, {Dispatch, SetStateAction} from "react";
import {Card, CardContent, Grid} from "@mui/material";
import {Outlet, QuestionMark} from "@mui/icons-material";

interface ServiceDisplayProps {
    services: ServiceType[];
    setServices: Dispatch<SetStateAction<ServiceType>[]>;
}

const ServiceDisplay: React.FC<ServiceDisplayProps> = ({services, setServices}) => {

    const updateService = async (iid: number, value: string|number|boolean, aid: number) => {
        const response = await fetch('http://localhost:18081/updateService', {
            method: 'POST',
            body: JSON.stringify({
                iid,
                value,
                aid,
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const js = await response.json();
        setServices(js['services']);
    }

    const resolveNextValue = (value: number) => {
        return value === 0 ? 1 : 0;
    }

    const handleServiceIcon = (type: string) => {
        if (type === 'Outlet') {
            return <Outlet fontSize="large" />;
        } else {
            return <QuestionMark fontSize="large" />;
        }
    }

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
                            () => updateService(
                                service.iid,
                                resolveNextValue(service.serviceCharacteristics[0].value),
                                service.aid,
                            )
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
