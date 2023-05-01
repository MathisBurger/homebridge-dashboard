import express, {Express, Request, Response} from 'express';
import {Logger, PlatformConfig} from 'homebridge';
import {HapClient, ServiceType} from '@oznu/hap-client';
import {Server} from 'http';
import {Server as SocketServer} from 'socket.io';
import cors from 'cors';
import BadRequestException from './error/BadRequestException';
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
      const data = (await this.client.getAllServices()).filter((s) => s.type !== 'ProtocolInformation');
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
    const all = await client.getAllServices();
    const service: ServiceType|undefined = all.find((s) => s.iid === req.body.iid && s.aid === req.body.aid);
    if (!service) {
      throw new BadRequestException('Service not found');
    }
    if (!service.getCharacteristic || service.serviceCharacteristics.length === 0) {
      throw new BadRequestException('No characteristics on service');
    }
    const characteristic = service.getCharacteristic(service.serviceCharacteristics[0].type);

    if (!characteristic || !characteristic.canWrite) {
      const types = service.serviceCharacteristics.filter(x => x.canWrite).map(x => `'${x.type}'`).join(', ');
      throw new BadRequestException(`Invalid characteristicType. Valid types are: ${types}.`);
    }

    let value: string|number|boolean = req.body.value;

    // integers
    if (['uint8', 'uint16', 'uint32', 'uint64'].includes(characteristic.format)) {
      value = parseInt(value as string, 10);
      if (characteristic.minValue !== undefined && value < characteristic.minValue) {
        throw new BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`);
      }
      if (characteristic.maxValue !== undefined && value > characteristic.maxValue) {
        throw new BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`);
      }
    }

    // floats
    if (characteristic.format === 'float') {
      value = parseFloat(value as string);
      if (characteristic.minValue !== undefined && value < characteristic.minValue) {
        throw new BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`);
      }
      if (characteristic.maxValue !== undefined && value > characteristic.maxValue) {
        throw new BadRequestException(`Invalid value. The value must be between ${characteristic.minValue} and ${characteristic.maxValue}.`);
      }
    }

    // booleans
    if (characteristic.format === 'bool') {
      if (typeof value === 'string') {
        if (['true', '1'].includes(value.toLowerCase())) {
          value = true;
        } else if (['false', '0'].includes(value.toLowerCase())) {
          value = false;
        }
      } else if (typeof value === 'number') {
        value = value === 1;
      }

      if (typeof value !== 'boolean') {
        throw new BadRequestException('Invalid value. The value must be a boolean (true or false).');
      }
    }

    if (!service.refreshCharacteristics || !characteristic.setValue) {
      throw new BadRequestException('Invalid data');
    }

    try {
      await characteristic.setValue(value);
      await service.refreshCharacteristics();
    } catch (e) {
      throw new BadRequestException('Error');
    }

    const services = (await client.getAllServices()).filter((s) => s.type !== 'ProtocolInformation');
    res.send({services});
  }


}

export default WebServer;
