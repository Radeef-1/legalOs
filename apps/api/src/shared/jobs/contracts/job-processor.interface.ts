import { JobRecord, JobType } from './job-data.interface';

export interface IJobProcessor<T = any> {
  readonly jobType: JobType;
  process(job: JobRecord<T>, updateProgress: (progress: number) => void): Promise<any>;
}
