import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async findBestMatches(opportunityId: string, limit = 10) {
    const opportunity = await this.prisma.gigOpportunity.findUnique({
      where: { id: opportunityId },
      include: { store: true },
    });
    if (!opportunity) return [];

    const workers = await this.prisma.intermittentWorker.findMany({
      where: { status: 'ACTIVE' },
      include: { user: { select: { fullName: true, phone: true, metadata: true } } },
    });

    const storeLat = Number(opportunity.store.lat);
    const storeLng = Number(opportunity.store.lng);

    const scored = workers.map((worker) => {
      const workerLat = (worker.user.metadata as any)?.lat || 0;
      const workerLng = (worker.user.metadata as any)?.lng || 0;
      const distance = this.calculateDistance(storeLat, storeLng, workerLat, workerLng);
      const ratingScore = (Number(worker.rating) / 5) * 50;
      const distanceScore = Math.max(0, 50 - distance * 5);
      return {
        workerId: worker.id,
        worker,
        matchScore: Math.round(ratingScore + distanceScore),
        distance: Math.round(distance * 10) / 10,
      };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
