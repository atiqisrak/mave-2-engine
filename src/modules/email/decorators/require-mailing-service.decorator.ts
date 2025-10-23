import { SetMetadata } from '@nestjs/common';

export const MAILING_SERVICE_KEY = 'mailing_service';
export const RequireMailingService = () => SetMetadata(MAILING_SERVICE_KEY, true);
