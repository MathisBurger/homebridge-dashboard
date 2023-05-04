import {
  API,
  Logger,
  PlatformConfig,
  IndependentPlatformPlugin,
} from 'homebridge';
import WebServer from './server/server';
import {HapClient} from '@oznu/hap-client';

/**
 * The main plugin class that is registered.
 */
export class HomebridgeDashboardPlugin implements IndependentPlatformPlugin {

  /**
   * @private Custom web server
   */
  private requestServer?: WebServer;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    // Creates a client for reading data from home-bridge
    const client = new HapClient({
      pin: '933-27-300',
      logger: this.log,
      config: {},
    });

    // Creates web server
    this.createHttpService(client);
  }

  /**
   * Creates a simple web serevr and listens to it.
   *
   * @param client The HAP client for home-bridge
   */
  createHttpService(client: HapClient) {
    this.requestServer = new WebServer(this.log, this.config, client, __dirname + '/static');
    this.requestServer.listen();
  }
}
