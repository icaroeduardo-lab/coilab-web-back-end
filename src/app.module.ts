import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { FlowModule } from './modules/flow/flow.module';
import { ApplicantModule } from './modules/applicant/applicant.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';

@Module({
  imports: [AuthModule, ProjectModule, TaskModule, FlowModule, ApplicantModule, UserModule],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
