
export class ConfigService {
  public readonly envConfig: { [ key: string ]: string };

  constructor() {
    this.envConfig = process.env;
  }

  get(key: string): string {
    return this.envConfig[ key ];
  }
}
