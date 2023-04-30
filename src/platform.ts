import {
  API,
  Logger,
  PlatformConfig,
  IndependentPlatformPlugin,
} from 'homebridge';
import WebServer from "./server/server";


export class HomebridgeDashboardPlugin implements IndependentPlatformPlugin {

  private requestServer?: WebServer;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);
    this.createHttpService();
  }

  createHttpService() {
    this.requestServer = new WebServer(this.log, this.config);
    this.requestServer.listen();
  }
}
