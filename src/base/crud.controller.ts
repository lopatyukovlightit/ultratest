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
