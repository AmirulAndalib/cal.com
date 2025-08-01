import { PrismaBookingRepository } from "@/lib/repositories/prisma-booking.repository";
import { PrismaEventTypeRepository } from "@/lib/repositories/prisma-event-type.repository";
import { PrismaFeaturesRepository } from "@/lib/repositories/prisma-features.repository";
import { PrismaOOORepository } from "@/lib/repositories/prisma-ooo.repository";
import { PrismaRoutingFormResponseRepository } from "@/lib/repositories/prisma-routing-form-response.repository";
import { PrismaScheduleRepository } from "@/lib/repositories/prisma-schedule.repository";
import { PrismaSelectedSlotRepository } from "@/lib/repositories/prisma-selected-slot.repository";
import { PrismaTeamRepository } from "@/lib/repositories/prisma-team.repository";
import { PrismaUserRepository } from "@/lib/repositories/prisma-user.repository";
import { CacheService } from "@/lib/services/cache.service";
import { CheckBookingLimitsService } from "@/lib/services/check-booking-limits.service";
import { Injectable } from "@nestjs/common";

import { AvailableSlotsService as BaseAvailableSlotsService } from "@calcom/platform-libraries/slots";

@Injectable()
export class AvailableSlotsService extends BaseAvailableSlotsService {
  constructor(
    oooRepoDependency: PrismaOOORepository,
    scheduleRepoDependency: PrismaScheduleRepository,
    teamRepository: PrismaTeamRepository,
    routingFormResponseRepository: PrismaRoutingFormResponseRepository,
    bookingRepository: PrismaBookingRepository,
    selectedSlotRepository: PrismaSelectedSlotRepository,
    eventTypeRepository: PrismaEventTypeRepository,
    userRepository: PrismaUserRepository,
    featuresRepository: PrismaFeaturesRepository
  ) {
    super({
      oooRepo: oooRepoDependency,
      scheduleRepo: scheduleRepoDependency,
      teamRepo: teamRepository,
      routingFormResponseRepo: routingFormResponseRepository,
      bookingRepo: bookingRepository,
      selectedSlotRepo: selectedSlotRepository,
      eventTypeRepo: eventTypeRepository,
      userRepo: userRepository,
      checkBookingLimitsService: new CheckBookingLimitsService(bookingRepository) as any,
      cacheService: new CacheService(featuresRepository),
    });
  }
}
