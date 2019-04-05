import { BadRequestException, NotFoundException, Type } from '@nestjs/common';
import { Validator } from 'class-validator';
import { FindConditions, Repository } from 'typeorm';

export interface IAllowedSearchField {
  name: string;
  validatorFuncName?: string;
}

export abstract class BaseService<T> {
  allowedSearchFields: IAllowedSearchField[] = [];
  constructor(protected readonly type: Type<T>, protected readonly repository: Repository<T>) {
  }

  /**
   * Check for the existence of an entity, throw 404 if not found
   * @param {string} id - entity UUID
   */
  protected async checkAnExistingEntityById(id: string): Promise<void> {
    if (!await this.repository.findOne(id)) {
      throw new NotFoundException(`${this.type.name} with id: ${id} is not exist`);
    }
  }

  /**
   * Get only allowed search options. Also validate them.
   * @param {object} params - search parameters requiring verification
   * @return FindConditions<Type>
   */
  protected getOnlyAllowedSearchParams(params: any): FindConditions<T> {
    const result: FindConditions<T> = {};
    const validator = new Validator();
    this.allowedSearchFields.forEach((field) => {
      if (params[ field.name ] !== undefined && params[ field.name ] !== null) {
        if (!!field.validatorFuncName && !!validator[ field.validatorFuncName ]) {
          if (!validator[ field.validatorFuncName ](params[ field.name ])) {
            throw new BadRequestException(`Param ${field.name} is not valid`);
          }
        }
        result[ field.name ] = params[ field.name ];
      }
    });
    return result;
  }
}
