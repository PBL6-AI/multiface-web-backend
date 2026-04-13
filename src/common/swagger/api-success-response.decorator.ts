import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

type ApiSuccessResponseDocOptions = {
  description: string;
  model: Type<unknown>;
  isArray?: boolean;
  status?: number;
};

export function ApiSuccessResponseDoc({
  description,
  model,
  isArray = false,
  status = 200,
}: ApiSuccessResponseDocOptions) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: isArray
            ? {
                type: 'array',
                items: {
                  $ref: getSchemaPath(model),
                },
              }
            : {
                $ref: getSchemaPath(model),
              },
        },
      },
    }),
  );
}
