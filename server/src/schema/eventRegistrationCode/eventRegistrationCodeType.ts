import { builder } from '../../builder';
import { RegistrationStatus } from '../../generated/prisma';
import prisma from '../../client';

export const eventRegistrationCodeType = builder.prismaObject(
  'EventRegistrationCode',
  {
    findUnique: (eventRegistrationCode) => ({
      id: eventRegistrationCode.id,
    }),
    fields: (t) => ({
      id: t.exposeID('id'),
      createdAt: t.expose('createdAt', { type: 'DateTime' }),
      createdById: t.exposeID('createdById'),
      creator: t.prismaField({
        type: 'User',
        resolve: (query, parent, args, context, info) => {
          return prisma.user.findUnique({
            where: { id: parent.createdById },
            ...query,
          });
        },
      }),
      registrationToRemoveId: t.exposeID('registrationToRemoveId', {
        nullable: true,
      }),
      registrationCreatedId: t.exposeID('registrationCreatedId', {
        nullable: true,
      }),
      targetEvent: t.relation('targetEvent'),
      targetEventId: t.exposeID('eventId'),
      isPublic: t.exposeBoolean('isPublic'),
      status: t.expose('status', { type: RegistrationStatus }),
      sepaAllowed: t.exposeBoolean('sepaAllowed'),
      connectedRegistrations: t.relation('connectedRegistrations'),
      transaction: t.relation('transaction'),
      transactionId: t.exposeID('transactionId', { nullable: true }),
      registrationToRemove: t.prismaField({
        type: 'EventRegistration',
        resolve: async (query, parent, args, context, info) => {
          return prisma.eventRegistration.findUnique({
            ...query,
            where: { id: parent.registrationToRemoveId ?? undefined },
          });
        },
      }),
      registrationCreated: t.prismaField({
        type: 'EventRegistration',
        resolve: async (query, parent, args, context, info) => {
          return prisma.eventRegistration.findUnique({
            ...query,
            where: { id: parent.registrationCreatedId ?? undefined },
          });
        },
      }),
    }),
  }
);
