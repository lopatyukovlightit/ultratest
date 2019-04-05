import { CrudController } from './crud.controller';
import { CrudService, EntityWithId } from '../services/crud.service';
import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { DatabaseModule } from '../../test/repository.mock';
import { classToPlain, plainToClass } from 'class-transformer';
import { BadRequestException, Controller, Inject, Optional } from '@nestjs/common';
import { IsString } from 'class-validator';
import { ClassType } from 'class-transformer/ClassTransformer';

class TestEntity implements EntityWithId {
  id: string;
  @IsString()
    // @ts-ignore
  test: string;
}

class ResponseDto extends TestEntity {
  responseAdditional: any = 'additional';
}

class TestService extends CrudService<TestEntity> {
  constructor(repository: Repository<any>) {
    super(TestEntity, repository);
  }
}

@Controller()
  // @ts-ignore
class TestController extends CrudController<TestEntity> {
  // @ts-ignore
  constructor(service: TestService, @Optional() @Inject('ResponseDto') responseDto: ClassType<any>) {
    super(service, TestEntity, undefined, undefined, responseDto);
  }
}

async function createTestModule(withResponseDto: boolean = false): Promise<{ crudController: TestController, crudService: TestService }> {
  const providers = [
    ...DatabaseModule.create([ { token: 'TestRepo', type: TestEntity } ]),
    {
      provide: TestService,
      useFactory: (repository) => new TestService(repository),
      inject: [ 'TestRepo' ],
    },
  ];
  if (withResponseDto) {
    providers.push({
      provide: 'ResponseDto',
      useValue: ResponseDto,
    });
  }
  const module = await Test.createTestingModule({
    controllers: [
      TestController,
    ],
    providers,
  }).compile();
  return {
    crudController: module.get<TestController>(TestController),
    crudService: module.get<TestService>(TestService),
  };
}

describe('[BaseClass] CrudControler', () => {
  let crudController: TestController;
  let crudService: TestService;

  describe('method: getAll', () => {
    describe('WHEN method getAll has called', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule());
      });
      it('THEN should return array of entities', async () => {
        const mock = [ new TestEntity(), new TestEntity() ];
        const plain = classToPlain<TestEntity[]>(mock);
        const result = plainToClass(TestEntity, plain);
        jest.spyOn(crudService, 'getAllEntities').mockImplementation(async () => await mock);
        expect(await crudController.getAll()).toMatchObject(result);
      });
    });
    describe('WHEN method getAll has called with response dto', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule(true));
      });
      it('THEN should return array of entities', async () => {
        const mock = [ { test: 'test1' }, { test: 'test2' } ];
        const entities = plainToClass<TestEntity, object[]>(TestEntity, mock);
        const result = plainToClass(ResponseDto, mock);
        jest.spyOn(crudService, 'getAllEntities').mockImplementation(async () => await entities);
        expect(await crudController.getAll()).toMatchObject(result);
      });
    });
  });

  describe('method: getById', () => {
    describe('WHEN method getById has called', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule());
      });
      describe('AND with id param', () => {
        it('THEN should call crudService.getEntityById with id', async () => {
          const id = '123';
          const spy = jest.spyOn(crudService, 'getEntityById');
          spy.mockImplementation(async () => await new TestEntity());
          await crudController.getById(id);
          expect(spy).toHaveBeenCalledWith(id);
        });

        it('THEN should return entity', async () => {
          const id = '123';
          const mock = new TestEntity();
          const plain = classToPlain<TestEntity>(mock);
          const result = plainToClass(TestEntity, plain);
          jest.spyOn(crudService, 'getEntityById').mockImplementation(async () => await mock);
          expect(await crudController.getById(id)).toMatchObject(result);
        });
      });
    });
    describe('WHEN method getById has called with response dto', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule(true));
      });
      describe('AND with id param', () => {
        it('THEN should return entity', async () => {
          const id = '123';
          const mock = new TestEntity();
          const plain = classToPlain<TestEntity>(mock);
          const result = plainToClass(ResponseDto, plain);
          jest.spyOn(crudService, 'getEntityById').mockImplementation(async () => await mock);
          expect(await crudController.getById(id)).toMatchObject(result);
        });
      });
    });
  });

  describe('method: create', () => {
    describe('WHEN method create has called', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule());
      });
      describe('AND with  data', () => {
        it('THEN should call crudService.createEntity with body', async () => {
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'createEntity');
          spy.mockImplementation(async () => await new TestEntity());
          await crudController.create(data);
          expect(spy).toHaveBeenCalledWith(entity);
        });

        it('THEN should return entity', async () => {
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'createEntity');
          spy.mockImplementation(async () => entity);
          expect(await crudController.create(data)).toMatchObject(entity);
        });
      });
      describe('AND with invalid data and skipValidation = true', () => {
        it('THEN should call crudService.createEntity with body', async () => {
          const data = { test: { art: 's' } };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'createEntity');
          spy.mockImplementation(async () => await new TestEntity());
          await crudController.create(data, true);
          expect(spy).toHaveBeenCalledWith(entity);
        });

        it('THEN should return entity', async () => {
          const data = { test: { art: 's' } };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'createEntity');
          spy.mockImplementation(async () => entity);
          expect(await crudController.create(data, true)).toMatchObject(entity);
        });
      });
      describe('AND with invalid data', () => {
        it('THEN should not call crudService.createEntity with body', async () => {
          const data = { test: { art: 's' } };
          const spy = jest.spyOn(crudService, 'createEntity');
          spy.mockImplementation(async () => await new TestEntity());
          try {
            await crudController.create(data);
          } catch (e) {
            expect(spy).not.toHaveBeenCalled();
          }
        });
        it('THEN should throw error', async () => {
          const data = { test: { art: 's' } };
          let error;
          try {
            await crudController.create(data);
          } catch (e) {
            error = e;
          }
          expect(error).toBeInstanceOf(BadRequestException);
        });
      });
    });
    describe('WHEN method create has called with response dto', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule(true));
      });
      describe('AND with id param and data', () => {
        it('THEN should return entity', async () => {
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const response = plainToClass(ResponseDto, data);
          const spy = jest.spyOn(crudService, 'createEntity');
          spy.mockImplementation(async () => entity);
          expect(await crudController.create(data)).toMatchObject(response);
        });
      });
    });
  });

  describe('method: update', () => {
    describe('WHEN method update has called', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule());
      });
      describe('AND with id param and data', () => {
        it('THEN should call crudService.updateEntity with id and body', async () => {
          const id = '123';
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'updateEntity');
          spy.mockImplementation(async () => await plainToClass(TestEntity, data));
          await crudController.update(id, data);
          expect(spy).toHaveBeenCalledWith(id, entity);
        });

        it('THEN should return entity', async () => {
          const id = '123';
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'updateEntity');
          spy.mockImplementation(async () => entity);
          expect(await crudController.update(id, data)).toMatchObject(entity);
        });
      });
      describe('AND with id and invalid data and skipValidation = true', () => {
        it('THEN should call crudService.updateEntity with id and body', async () => {
          const id = '123';
          const data = { test: { art: 's' } };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'updateEntity');
          spy.mockImplementation(async () => await plainToClass(TestEntity, data));
          await crudController.update(id, data, true);
          expect(spy).toHaveBeenCalledWith(id, entity);
        });

        it('THEN should return entity', async () => {
          const id = '123';
          const data = { test: { art: 's' } };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'updateEntity');
          spy.mockImplementation(async () => entity);
          expect(await crudController.update(id, data, true)).toMatchObject(entity);
        });
      });
      describe('AND with id and invalid data', () => {
        it('THEN should not call crudService.createEntity with body', async () => {
          const data = { test: { art: 's' } };
          const spy = jest.spyOn(crudService, 'updateEntity');
          spy.mockImplementation(async () => await new TestEntity());
          try {
            await crudController.update('123', data);
          } catch (e) {
            expect(spy).not.toHaveBeenCalled();
          }
        });
        it('THEN should throw error', async () => {
          const data = { test: { art: 's' } };
          let error;
          try {
            await crudController.update('123', data);
          } catch (e) {
            error = e;
          }
          expect(error).toBeInstanceOf(BadRequestException);
        });
      });
    });
    describe('WHEN method update has called with response dto', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule(true));
      });
      describe('AND with id param and data', () => {
        it('THEN should return entity', async () => {
          const id = '123';
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const response = plainToClass(ResponseDto, data);
          const spy = jest.spyOn(crudService, 'updateEntity');
          spy.mockImplementation(async () => entity);
          expect(await crudController.update(id, data)).toMatchObject(response);
        });
      });
    });
  });

  describe('method: delete', () => {
    describe('WHEN method update has called', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule());
      });
      describe('AND with id param and data', () => {
        it('THEN should call crudService.deleteEntity with id', async () => {
          const id = '123';
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'deleteEntity');
          spy.mockImplementation(async () => entity);
          await crudController.delete(id);
          expect(spy).toHaveBeenCalledWith(id);
        });

        it('THEN should return entity', async () => {
          const id = '123';
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const spy = jest.spyOn(crudService, 'deleteEntity');
          spy.mockImplementation(async () => entity);
          expect(await crudController.delete(id)).toMatchObject(entity);
        });
      });
    });
    describe('WHEN method update has called with response dto', () => {
      beforeEach(async () => {
        ({ crudController, crudService } = await createTestModule(true));
      });
      describe('AND with id param', () => {
        it('THEN should return entity', async () => {
          const id = '123';
          const data = { test: 'test' };
          const entity = plainToClass(TestEntity, data);
          const response = plainToClass(ResponseDto, data);
          const spy = jest.spyOn(crudService, 'deleteEntity');
          spy.mockImplementation(async () => entity);
          expect(await crudController.delete(id)).toMatchObject(response);
        });
      });
    });
  });
});
