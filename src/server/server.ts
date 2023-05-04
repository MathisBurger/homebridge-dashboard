import express, {Express, Request, Response} from 'express';
import {Logger, PlatformConfig} from 'homebridge';
import {HapClient, ServiceType} from '@oznu/hap-client';
import {Server} from 'http';
import {Server as SocketServer} from 'socket.io';
import cors from 'cors';
import BadRequestException from './error/BadRequestException';
import bodyParser from 'body-parser';

/**
 * WebServer that serves all important data.
 */
class WebServer {

  private readonly server: Express;
  private readonly httpServer: Server;
  private readonly socket: SocketServer;

  constructor(
        private readonly log: Logger,
        private readonly config: PlatformConfig,
        public readonly client: HapClient,
        private readonly staticDir: string
  ) {


    this.log.info(this.staticDir);

    this.server = express();

    // Use cors
    this.server.use(cors({
      origin: '*',
    }));
    // Use JSON bodies only
    this.server.use(bodyParser.json());

    this.server.use(express.static(this.staticDir));

    // Provide client to request obj
    this.server.use((req, res, next) => {
      res.locals.hapClient = client;
      next();
    });

    // Endpoint for updating a service
    this.server.post('/updateService', WebServer.updateService);

    // Endpoint that serves all frontend files
    //this.server.get('/**', (req: Request, res: Response) => res.sendStatus(200));

    this.httpServer = new Server(this.server);
    this.socket = new SocketServer(this.httpServer, {
      cors: {
        origin: '*',
      },
    });

    // Send state of all services every 2.5s
    setInterval(async () => {
      const data = (await this.client.getAllServices()).filter((s) => s.type !== 'ProtocolInformation');
      this.socket.emit('state-changed', {data});
    }, 2500);
  }

  /**
   * Listen to the http server
   */
  public listen(): void {
    this.httpServer.listen(this.config.port, () => {
      this.log.info(`Started homebridge dashboard on port ${this.config.port}`);
    });
  }

  /**
   * Updates a specific service
   *
   * @param req Request object
   * @param res Response object
   * @private
   */
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
    const characteristic = service.getCharacteristic(req.body.characteristicType);

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
