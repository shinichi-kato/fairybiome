import type {
  ActivateRequest,
  DeactivateRequest,
  ListenRequest,
  PartConfig,
  ReportRequest,
} from './kernel.types';

type ActivateCompleted = {
  type: 'activateCompleted';
  botName: string;
  activatedParts: unknown[];
  failedParts: unknown[];
};

type DeactivateCompleted = {
  type: 'deactivateCompleted';
  botName: string;
  deactivatedParts: unknown[];
  failedParts: unknown[];
};

type ReportCompleted = {
  type: 'reportCompleted';
  botName: string;
  reports: unknown;
  failedParts: unknown[];
};

export default class Kernel {
  constructor(options?: { timeout?: number; partConfig?: PartConfig; debug?: boolean });
  initialize(botName: string): Promise<void>;
  activate(request: ActivateRequest): Promise<ActivateCompleted>;
  deactivate(request: DeactivateRequest): Promise<DeactivateCompleted>;
  report(request: ReportRequest): Promise<ReportCompleted>;
  listen(request: ListenRequest): Promise<void>;
  shutdown(botName: string): Promise<void>;
  static getInstance(options?: { timeout?: number; partConfig?: PartConfig; debug?: boolean }): Kernel;
}
