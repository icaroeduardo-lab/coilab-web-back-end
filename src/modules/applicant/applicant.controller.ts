import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post } from '@nestjs/common';
import { CreateApplicantUseCase } from '../../application/use-cases/applicant/create-applicant/CreateApplicantUseCase';
import { GetApplicantUseCase } from '../../application/use-cases/applicant/get-applicant/GetApplicantUseCase';
import { ListApplicantsUseCase } from '../../application/use-cases/applicant/list-applicants/ListApplicantsUseCase';
import { UpdateApplicantUseCase } from '../../application/use-cases/applicant/update-applicant/UpdateApplicantUseCase';
import { DeleteApplicantUseCase } from '../../application/use-cases/applicant/delete-applicant/DeleteApplicantUseCase';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';

@Controller('applicants')
export class ApplicantController {
  constructor(
    @Inject(CreateApplicantUseCase) private readonly createApplicant: CreateApplicantUseCase,
    @Inject(GetApplicantUseCase) private readonly getApplicant: GetApplicantUseCase,
    @Inject(ListApplicantsUseCase) private readonly listApplicants: ListApplicantsUseCase,
    @Inject(UpdateApplicantUseCase) private readonly updateApplicant: UpdateApplicantUseCase,
    @Inject(DeleteApplicantUseCase) private readonly deleteApplicant: DeleteApplicantUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateApplicantDto) {
    return this.createApplicant.execute(dto);
  }

  @Get()
  list() {
    return this.listApplicants.execute();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getApplicant.execute({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApplicantDto) {
    return this.updateApplicant.execute({ id, name: dto.name });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.deleteApplicant.execute({ id });
  }
}
