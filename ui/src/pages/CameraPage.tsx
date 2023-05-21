import React, {useEffect, useState} from 'react';
import {Box, Grid} from '@mui/material';
import {getProtocol, getUrl} from '../url';

/**
 * Configuration for a camera
 */
export interface CameraConfig {
    username: string;
    password: string;
    host: string;
    port: string;
    streamPath: string;
}

/**
 * Page that displays all cameras
 *
 * @constructor
 */
const CameraPage: React.FC = () => {

  const [cameras, setCameras] = useState<CameraConfig[]>([]);

  const buildCameraUrl = (config: CameraConfig) => {
    return `rtsp://${config.username}:${config.password}@${config.host}:${config.port}${config.streamPath}`;
  };

  useEffect(() => {
    fetch(`${getProtocol()}//${getUrl()}/cameraConfiguration`)
      .then((res) => res.json())
      .then((data) => setCameras(data.cameras));
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%'}}>
      <Grid container direction="row">
        {cameras.map((cam) => (
          <Grid item xs={6}>
            <video autoPlay={true}>
              <source src={`${getProtocol()}//${getUrl()}/camera/stream?streamUrl=${buildCameraUrl(cam)}`} />
            </video>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CameraPage;
