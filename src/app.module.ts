import { Module } from '@nestjs/common';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { FlowModule } from './modules/flow/flow.module';
import { ApplicantModule } from './modules/applicant/applicant.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [ProjectModule, TaskModule, FlowModule, ApplicantModule, UserModule],
})
export class AppModule {}
