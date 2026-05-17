import { IsIn, IsString } from 'class-validator';

export const KYC_DOCUMENT_TYPES = [
  'NATIONAL_ID',
  'PASSPORT',
  'PROOF_OF_ADDRESS',
  'SELFIE_WITH_ID'
] as const;

export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

export class UploadKycDto {
  @IsString()
  @IsIn(KYC_DOCUMENT_TYPES)
  documentType!: KycDocumentType;
}
