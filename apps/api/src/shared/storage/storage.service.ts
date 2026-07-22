import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly uploadRootDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadRootDir)) {
      fs.mkdirSync(this.uploadRootDir, { recursive: true });
    }
  }

  async uploadFile(file: any, tenantId: string, caseId?: string): Promise<{ storagePath: string; fileType: string }> {
    const fileType = file.mimetype || path.extname(file.originalname);
    
    const relativeFolder = caseId 
      ? path.join(tenantId, 'cases', caseId)
      : path.join(tenantId, 'general');
      
    const absoluteFolder = path.join(this.uploadRootDir, relativeFolder);
    
    if (!fs.existsSync(absoluteFolder)) {
      fs.mkdirSync(absoluteFolder, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    const absolutePath = path.join(absoluteFolder, uniqueFilename);
    
    await fs.promises.writeFile(absolutePath, file.buffer);

    const storagePath = path.join('uploads', relativeFolder, uniqueFilename).replace(/\\/g, '/');
    return {
      storagePath,
      fileType,
    };
  }

  async getFileBuffer(storagePath: string): Promise<Buffer> {
    const relativePath = storagePath.startsWith('uploads/') 
      ? storagePath.replace('uploads/', '') 
      : storagePath;
      
    const absolutePath = path.resolve(this.uploadRootDir, relativePath);
    
    if (!absolutePath.startsWith(this.uploadRootDir)) {
      throw new Error('Access denied: Directory traversal detected');
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error('File not found');
    }

    return fs.promises.readFile(absolutePath);
  }
}
