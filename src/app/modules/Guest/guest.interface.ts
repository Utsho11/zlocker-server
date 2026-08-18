export interface IGuestText {
  lockerId: string;
  content: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGuestFile {
  lockerId: string;
  link: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  resourceType: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
