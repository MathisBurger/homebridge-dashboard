import express, {Express, Request, Response} from 'express';
import {API, Logger, PlatformConfig} from 'homebridge';
import {HapClient} from '@oznu/hap-client';

type ExtendedRequest = Request & {hapClient: HapClient};


class WebServer {

  private server: Express;

  constructor(
        private readonly log: Logger,
        private readonly config: PlatformConfig,
        public readonly client: HapClient,
  ) {
    this.server = express();
    this.server.use((req, res, next) => {
      res.locals.hapClient = client;
      next();
    });
    this.server.get('/initDevices', WebServer.getInitialAccessories);
    this.server.get('/*', (req: Request, res: Response) => res.sendStatus(200));
  }

  public listen(): void {
    this.server.listen(this.config.port, () => {
      this.log.info(`Started homebridge dashboard on port ${this.config.port}`);
    });
  }

  private static async getInitialAccessories(req: Request, res: Response): Promise<void> {
    const services = await res.locals.hapClient.getAllServices();
    res.send({service: services});
  }


}

export default WebServer;
