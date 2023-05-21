import {Box, Card, CardContent, Grid, Typography} from '@mui/material';
import {routes, RouteType} from '../routes';
import {useMemo} from 'react';
import {FrontendRoute, frontendRoutes} from '../Webroutes';
import {Link} from 'react-router-dom';

const allowedRoutes: RouteType[] = [RouteType.servicePage, RouteType.cameraPage];

const StartPage = () => {

  const displayedRoutes = useMemo<FrontendRoute[]>(
    () => {
      const r = [];
      for (const route of allowedRoutes) {
        const _r: FrontendRoute|null = Object.entries(frontendRoutes).filter(([i]) => i === route)[0][1];
        if (_r) {
          r.push(_r);
        }
      }
      return r;
    },
    [routes],
  );

  return (
    <Box sx={{ width: '100%', position: 'absolute', top: '10%', left: '50%', transform: 'translate(-40%, -10%)' }}>
      <Grid container direction="row" spacing={2}>
        {displayedRoutes.map((route) => (
          <Grid item xs={3}>
            <Link to={route.path}>
              <Card style={{width: '100%'}}>
                <CardContent>
                  <Grid container direction="row" spacing={2}>
                    <Grid item xs={12}>{route.icon}</Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6">{route.name}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StartPage;
