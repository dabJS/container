import { DependencyContainer } from 'tsyringe';

export type Listener = {
  name: string;
  func: string;
  provider: string;
};

export interface IBaseContainer {
  loadProviders(): Function[];
  loadConfigs(): any;
  loadContainer(): void;
  getContainer(): DependencyContainer;
}
