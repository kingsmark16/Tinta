import {
  BadRequestException,
  ValidationPipe,
  type ArgumentMetadata,
} from '@nestjs/common';
import { CreateEntryDto } from './create-entry.dto.js';

const pipe = new ValidationPipe({
  transform: false,
  whitelist: true,
  forbidNonWhitelisted: true,
});

const metadata: ArgumentMetadata = {
  type: 'body',
  metatype: CreateEntryDto,
};

const validBody = {
  content: '  Synthetic diary text.  ',
  entryDate: '2024-02-29',
};

describe('CreateEntryDto validation', () => {
  it('accepts valid fields without changing content', async () => {
    await expect(pipe.transform(validBody, metadata)).resolves.toEqual(
      validBody,
    );
  });

  it('accepts an optional string title', async () => {
    const body = { ...validBody, title: 'A sample title' };
    await expect(pipe.transform(body, metadata)).resolves.toEqual(body);
  });

  it.each([
    { name: 'blank content', body: { ...validBody, content: ' \t ' } },
    {
      name: 'impossible date',
      body: { ...validBody, entryDate: '2025-02-29' },
    },
    {
      name: 'client-supplied owner',
      body: { ...validBody, userId: 'other-user' },
    },
    { name: 'null title', body: { ...validBody, title: null } },
  ])('rejects $name', async ({ body }) => {
    await expect(pipe.transform(body, metadata)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
