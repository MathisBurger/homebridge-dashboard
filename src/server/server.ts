import express, {Express, Request, Response} from 'express';
import {Logger, PlatformConfig} from 'homebridge';
import {HapClient, ServiceType} from '@oznu/hap-client';
import {Server} from "http";
import {Server as SocketServer} from "socket.io";
import cors from "cors";
import bodyParser from 'body-parser';

class WebServer {

  private readonly server: Express;
  private readonly httpServer: Server;
  private readonly socket: SocketServer;

  constructor(
        private readonly log: Logger,
        private readonly config: PlatformConfig,
        public readonly client: HapClient,
  ) {
    this.server = express();
    this.server.use(cors({
      origin: '*',
    }));
    this.server.use(bodyParser.json());
    this.server.use((req, res, next) => {
      res.locals.hapClient = client;
      next();
    });
    this.server.post('/updateService', WebServer.updateService);
    this.server.get('/**', (req: Request, res: Response) => res.sendStatus(200));
    this.httpServer = new Server(this.server);
    this.socket = new SocketServer(this.httpServer, {
      cors: {
        origin: '*',
      },
    });
    setInterval(async () => {
      const data = (await this.client.getAllServices()).filter((s) => s.type !== 'ProtocolInformation');;
      this.socket.emit('state-changed', {data});
    }, 2500);
  }

  public listen(): void {
    this.httpServer.listen(this.config.port, () => {
      this.log.info(`Started homebridge dashboard on port ${this.config.port}`);
    });
  }

  private static async updateService(req: Request, res: Response): Promise<void> {
    const client = res.locals.hapClient as HapClient;
    const body = req.body;
    const all = await client.getAllServices();
    let service: ServiceType|null = null;
    for (let a of all) {
      if (a.aid === body.aid && a.iid === body.iid) {
        service = a;
        break;
      }
    }
    // Improve update process for all types of accessories
    if (service !== null && service !== undefined && service.getCharacteristic) {
      const preChar = service.serviceCharacteristics.length > 0 ? service.serviceCharacteristics[0] : null;
      if (preChar) {
        const characteristic = await service.getCharacteristic(preChar.type);
        if (characteristic.setValue && service.refreshCharacteristics) {
          await characteristic.setValue(req.body.value);
          await service.refreshCharacteristics();
        }
      }
    }
    const services = (await client.getAllServices()).filter((s) => s.type !== 'ProtocolInformation');
    res.send({services});
  }


}

export default WebServer;
