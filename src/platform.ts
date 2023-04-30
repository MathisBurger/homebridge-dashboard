import {
  API,
  Logger,
  PlatformConfig,
  IndependentPlatformPlugin,
} from 'homebridge';
import WebServer from "./server/server";
import {HapClient} from "@oznu/hap-client";


export class HomebridgeDashboardPlugin implements IndependentPlatformPlugin {

  private requestServer?: WebServer;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);
    const client = new HapClient({
      pin: '933-27-300',
      logger: this.log,
      config: {},
    });
    this.createHttpService(client);
  }

  createHttpService(client: HapClient) {
    this.requestServer = new WebServer(this.log, this.config, client);
    this.requestServer.listen();
  }
}
