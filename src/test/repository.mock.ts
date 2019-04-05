import { ObjectType } from 'typeorm';
import { Provider } from '@nestjs/common';

export function createMockRepository<T>(type: ObjectType<T>) {
  // @ts-ignore
  const entity = new type();
  return {
    find: async (): Promise<T> => {
      return await entity;
    },
  };
}

export class DatabaseModule {
  static create(entities: { token: string, type: ObjectType<any> }[]): Provider[] {
    const providers: Provider[] = [];
    entities.forEach((entity) => {
      providers.push({
        provide: entity.token,
        useFactory: () => {
          return createMockRepository<any>(entity.type);
        },
      });
    });
    return providers;
  }
}

/*
export function createProvider(){
  return {
    provide:
  }
}
*/
