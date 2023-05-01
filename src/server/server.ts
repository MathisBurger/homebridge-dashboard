import express, {Express, Request, Response} from 'express';
import {Logger, PlatformConfig} from 'homebridge';
import {HapClient} from '@oznu/hap-client';
import {Server} from "http";
import {Server as SocketServer} from "socket.io";

class WebServer {

  private server: Express;
  private httpServer: Server;
  private readonly socket: SocketServer;

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
    this.httpServer = new Server(this.server);

    this.socket = new SocketServer(this.httpServer);
    this.socket.on('connection', (socket) => {
      socket.send('Hello');
    });
  }

  public listen(): void {
    this.httpServer.listen(this.config.port, () => {
      this.log.info(`Started homebridge dashboard on port ${this.config.port}`);
    });
  }

  private static async getInitialAccessories(req: Request, res: Response): Promise<void> {
    const services = await res.locals.hapClient.getAllServices();
    res.send({service: services});
  }


}

export default WebServer;
