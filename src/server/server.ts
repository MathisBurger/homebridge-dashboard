import express, {Express, Request, Response} from 'express';
import {Logger, PlatformConfig} from 'homebridge';


class WebServer {

  private server: Express;

  constructor(
        public readonly log: Logger,
        public readonly config: PlatformConfig,
  ) {
    this.server = express();
    this.server.get('/', (req: Request, res: Response) => res.sendStatus(200));
  }

  public listen(): void {
    this.server.listen(this.config.port, () => {
      this.log.info(`Started homebridge dashboard on port ${this.config.port}`);
    });
  }


}

export default WebServer;
