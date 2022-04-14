import { DependencyContainer } from 'tsyringe';
import { EventEmmiter } from './event';
import { Listener, IBaseContainer } from './types';

export abstract class BaseContainer implements IBaseContainer {
  abstract loadProviders(): Function[];

  abstract loadConfigs(): Record<string, any>;

  private listeners: Listener[] = [];

  constructor(protected readonly container: DependencyContainer) {}

  loadContainer(): void {
    this.registerProviders();
    this.registerConfigs();
    this.registerListeners();
  }

  private registerProviders(): void {
    this.loadProviders().forEach(provider => {
      const provider_name = provider.name;
      this.container.register(provider_name, provider as any);

      const { listen } = provider.prototype || {};

      if (listen) {
        const { name, func } = listen;
        this.listeners.push({
          name,
          func,
          provider: provider_name,
        });
      }
    });
  }

  private registerListeners() {
    const event = EventEmmiter.getInstance();

    this.listeners.forEach(listener => {
      const { name, func, provider } = listener;

      event.on(name, async (data: any) => {
        const instance = this.container.resolve(provider) as Record<
          string,
          any
        >;

        await instance[func](data);
      });
    });
  }

  private registerConfigs(): void {
    const configs = this.loadConfigs();

    for (const key in configs) {
      if (key) {
        this.container.register(key, { useValue: configs[key] });
      }
    }
  }

  getContainer(): DependencyContainer {
    return this.container;
  }
}
