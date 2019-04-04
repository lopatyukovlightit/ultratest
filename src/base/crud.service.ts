import { IServiceOptions } from '@base/interfaces/service-options.interface';
import { NotFoundException, Type } from '@nestjs/common';
import { classToPlain, plainToClassFromExist } from 'class-transformer';
import { FindConditions, Repository, SelectQueryBuilder } from 'typeorm';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseService } from './base.service';

export interface EntityWithId extends QueryPartialEntity<any> {
  id: string;
}

export abstract class CrudService<T extends EntityWithId, C = T, U = C> extends BaseService<T> {
  protected options: IServiceOptions = {};

  constructor(type: Type<T>, repository: Repository<T>) {
    super(type, repository);
  }

  public async getAllEntities(params?: any): Promise<T[]> {
    params = params ? this.getOnlyAllowedSearchParams(params) : {};
    const findConditions: FindConditions<T> = params ? this.getOnlyAllowedSearchParams(params) : {};
    return await this.repository.find(findConditions);
  }

  public async getEntityById(id: string): Promise<T> {
    const qb = this.getQueryBuilder();
    qb.where('entity.id = :id', { id });
    const entity = qb.getOne();
    if (!entity) {
      throw new NotFoundException(`${this.type.name} with id: ${id} is not exist`);
    }
    return entity;
  }

  public async createEntity(obj: C | T): Promise<T> {
    const data = classToPlain(obj);
    const entity = plainToClassFromExist(this.repository.create(), data) as unknown as T;
    const savedEntity = await this.repository.save(entity);
    return this.getEntityById(savedEntity.id);
  }

  public async updateEntity(id: string, data: U | T): Promise<T> {
    await this.checkAnExistingEntityById(id);
    const existingEntity = await this.getEntityById(id);
    const updateData = classToPlain(data);
    const entity = plainToClassFromExist(existingEntity, updateData);
    return await this.repository.save(entity);
  }

  public async deleteEntity(id: string): Promise<T> {
    await this.checkAnExistingEntityById(id);
    const entity = await this.getEntityById(id);
    await this.repository.delete(id);
    return entity;
  }

  protected getQueryBuilder(): SelectQueryBuilder<T> {
    const qb = this.repository.createQueryBuilder('entity');
    if (this.options) {
      if (this.options.relations && this.options.relations.length > 0) {
        for (const relation of this.options.relations) {
          qb.leftJoinAndSelect(`entity.${relation.name}`, relation.name);
          if (relation.order) {
            qb.orderBy(`${relation.name}.${relation.order.column}`, relation.order.type);
          }
          if (relation.subrelation) {
            const subrelation = relation.subrelation;
            qb.leftJoinAndSelect(`${relation.name}.${subrelation.name}`, subrelation.name);
            if (subrelation.order) {
              qb.orderBy(`${subrelation.name}.${subrelation.order.column}`, subrelation.order.type);
            }
          }
        }
      }
    }

    return qb;
  }
}
