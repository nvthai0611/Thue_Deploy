declare module "vietqr" {
  export class VietQR {
    constructor(config: {
      clientID: string | undefined;
      apiKey: string | undefined;
    });
    getBanks(): Promise<any>;
  }
}
