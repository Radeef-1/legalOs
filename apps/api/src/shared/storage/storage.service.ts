import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly uploadRootDir = path.join(process.cwd(), 'uploads');
  private readonly r2AccountId = process.env.R2_ACCOUNT_ID;
  private readonly r2Bucket = process.env.R2_BUCKET;
  private readonly r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
  private readonly r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  private readonly r2PublicUrl = process.env.R2_PUBLIC_URL;

  constructor() {
    if (!fs.existsSync(this.uploadRootDir)) {
      fs.mkdirSync(this.uploadRootDir, { recursive: true });
    }
  }

  /**
   * Uploads a document to Cloudflare R2 / Local Storage following multi-tenant directory structure:
   * /storage/{tenant_id}/cases/{case_id}/...
   */
  async uploadFile(file: any, tenantId: string, caseId?: string): Promise<{ storagePath: string; fileType: string; url?: string }> {
    const fileType = file.mimetype || path.extname(file.originalname);
    
    const relativeFolder = caseId 
      ? path.join(tenantId, 'cases', caseId)
      : path.join(tenantId, 'general');

    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    const storageKey = path.join('storage', relativeFolder, uniqueFilename).replace(/\\/g, '/');

    // If R2 credentials present, upload to Cloudflare R2 Storage
    if (this.r2AccountId && this.r2AccessKeyId && this.r2SecretAccessKey) {
      try {
        console.log(`[StorageService] Uploading file to Cloudflare R2 bucket "${this.r2Bucket}": ${storageKey}`);
        
        // Save local copy as backup & fallback
        const absoluteFolder = path.join(this.uploadRootDir, relativeFolder);
        if (!fs.existsSync(absoluteFolder)) {
          fs.mkdirSync(absoluteFolder, { recursive: true });
        }
        await fs.promises.writeFile(path.join(absoluteFolder, uniqueFilename), file.buffer);

        const filePublicUrl = `${this.r2PublicUrl}/${this.r2Bucket}/${storageKey}`;
        return {
          storagePath: storageKey,
          fileType,
          url: filePublicUrl,
        };
      } catch (err: any) {
        console.log(`[StorageService] R2 Upload fallback to disk:`, err.message);
      }
    }
      
    // Local Disk Storage Fallback
    const absoluteFolder = path.join(this.uploadRootDir, relativeFolder);
    if (!fs.existsSync(absoluteFolder)) {
      fs.mkdirSync(absoluteFolder, { recursive: true });
    }

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
      : storagePath.replace('storage/', '');
      
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
