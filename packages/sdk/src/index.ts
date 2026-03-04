export interface ImpersonateKitConfig {
  apiKey: string;
}

export interface ImpersonateOptions {
  adminId: string;
  targetUserId: string;
  returnUrl?: string;
}

export interface ImpersonateResult {
  url: string;
  expiresAt: Date;
}

export class ImpersonateKit {
  private readonly apiKey: string;

  constructor(config: ImpersonateKitConfig) {
    this.apiKey = config.apiKey;
  }

  async impersonate(opts: ImpersonateOptions): Promise<ImpersonateResult> {
    void this.apiKey;
    void opts;
    throw new Error("Not implemented");
  }
}
