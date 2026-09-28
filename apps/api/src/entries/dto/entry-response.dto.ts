import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class EntryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string | null;

  @Expose()
  content!: string;

  @Expose()
  entryDate!: string;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;
}
