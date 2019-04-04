import { ParamUuidValidationPipe } from '@core/pipes/param-uuid-validation.pipe';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { validateSync } from 'class-validator';
import { CrudService, EntityWithId } from './crud.service';

export abstract class CrudController<T extends EntityWithId, C = T, U = C, R = T> {

  protected constructor(
    protected readonly service: CrudService<T, C, U>,
    private type?: ClassType<any>,
    private createDto?: ClassType<any>,
    private updateDto?: ClassType<any>,
    private responseDto?: ClassType<any>) {
  }

  /**
   * Find all entities
   * @param {object} params - search params
   * @returns Promise<Type | ResponseDto>
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  async getAll(@Query() params?: any): Promise<T[] | R[]> {
    let result = await this.service.getAllEntities(params);
    if (this.responseDto) {
      const plains = classToPlain(result) as any[];
      result = plainToClass(this.responseDto, plains);
    }
    return result;
  }

  /**
   * Find entity by UUID, throw 404 if not found
   * @param {string} id - entity UUID
   * @returns Promise<Type | ResponseDto>
   */
  @UsePipes(new ParamUuidValidationPipe('id'))
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<T | R> {
    let result: T | R = await this.service.getEntityById(id) as T;
    if (this.responseDto) {
      const plains = classToPlain(result) as any;
      result = plainToClass<R, object>(this.responseDto, plains);
    }
    return result;
  }

  /**
   * Create entity with a given payload
   * @param {Entity} data - entity data
   * @param {boolean} skipValidation - flag for skip validation (default=false)
   * @returns Promise<Type | ResponseDto>
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('')
  async create(@Body() data: C, skipValidation = false): Promise<T | R> {
    const dataInDto = skipValidation ? data : this.validateAndTransform<C>(data, this.createDto || this.type);
    let result: T | R = await this.service.createEntity(dataInDto);
    if (this.responseDto) {
      const plains = classToPlain(result) as any;
      result = plainToClass<R, object>(this.responseDto, plains);
    }
    return result;
  }

  /**
   * Find entity by UUID and update it with a given payload, throw 404 if not found
   * @param {string} id - entity UUID
   * @param {boolean} skipValidation - flag for skip validation (default=false)
   * @param {Entity} data - entity data
   * @returns Promise<Type | ResponseDto>
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ParamUuidValidationPipe('id'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: U, skipValidation = false): Promise<T | R> {
    const dataInDto = skipValidation ? data : this.validateAndTransform<U>(data, this.updateDto || this.type, true);
    let result: T | R = await this.service.updateEntity(id, dataInDto);
    if (this.responseDto) {
      const plains = classToPlain(result) as any;
      result = plainToClass<R, object>(this.responseDto, plains);
    }
    return result;
  }

  /**
   * Find a entity by UUID and delete it, throw 404 if not found
   * @param {string} id - entity UUID
   * @returns Promise<Type | ResponseDto>
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ParamUuidValidationPipe('id'))
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<T | R> {
    let result: T | R = await this.service.deleteEntity(id);
    if (this.responseDto) {
      const plains = classToPlain(result) as any;
      result = plainToClass<R, object>(this.responseDto, plains);
    }
    return result;
  }

  /**
   * Validate given payload and transform to Dto
   * @param {any} data - payload
   * @param {ClassType<any>} type - type (validate schema)
   * @param {boolean} skipMissingProperties - skip missing properties during validating
   * @returns Promise<Type | any>
   */
  private validateAndTransform<K>(data: any, type: ClassType<any>, skipMissingProperties = false): K | T {
    const dataInDto = plainToClass(type, data) as unknown as K | T;
    const errors = validateSync(dataInDto, {
      skipMissingProperties,
    });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return dataInDto;
  }
}
