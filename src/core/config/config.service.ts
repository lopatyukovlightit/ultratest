export class ConfigService {
  public readonly envConfig: { [ key: string ]: string };

  constructor() {
    this.envConfig = process.env;
  }

  /**
   * Get param by key
   * @param {string} key - param key
   * @return {string}
   */
  get(key: string): string {
    return this.envConfig[ key ];
  }
}
