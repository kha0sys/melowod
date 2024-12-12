import { IWodRepository } from '@/domain/repositories/IWodRepository';
import { Wod } from '@/domain/entities/Wod';

export class GetWodUseCase {
  constructor(private wodRepository: IWodRepository) {}

  async execute(id: string): Promise<Wod | null> {
    return this.wodRepository.getById(id);
  }
}
