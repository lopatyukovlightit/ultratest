import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { Validator } from 'class-validator';

export class ParamUuidValidationPipe implements PipeTransform {

  constructor(private readonly paramName: string) {
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const checkedValue = !metadata.data ? value[ this.paramName ] : value;
    if (!!checkedValue && metadata.type === 'param') {
      if (!new Validator().isUUID(checkedValue)) {
        throw new BadRequestException(`Parameter :${this.paramName} should be is uuid`);
      }
    }
    return value;
  }
}
