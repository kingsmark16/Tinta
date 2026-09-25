import {
  IsString,
  Matches,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidEntryDate } from '../entry-date.js';

@ValidatorConstraint({ name: 'isValidEntryDate', async: false })
class EntryDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidEntryDate(value);
  }

  defaultMessage(): string {
    return 'Entry Date must be a valid YYYY-MM-DD date';
  }
}

export class CreateEntryDto {
  @IsString()
  @Matches(/\S/, { message: 'Content must not be blank' })
  content!: string;

  @IsString()
  @Validate(EntryDateConstraint)
  entryDate!: string;

  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  title?: string;
}
