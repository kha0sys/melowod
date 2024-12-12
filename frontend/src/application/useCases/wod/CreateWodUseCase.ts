import { IWodRepository } from '@/domain/repositories/IWodRepository';
import { Wod } from '@/domain/entities/Wod';

export class CreateWodUseCase {
  constructor(private wodRepository: IWodRepository) {}

  async execute(wodData: Omit<Wod, 'id' | 'createdAt' | 'updatedAt'>): Promise<Wod> {
    // Aquí podríamos agregar validaciones de negocio adicionales
    return this.wodRepository.create(wodData);
  }
}
