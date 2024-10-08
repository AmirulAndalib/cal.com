// TODO: Queries in this file are not optimized. Need to optimize them.
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import prisma from "@calcom/prisma";
import type { Attribute } from "../types/types";

async function getAttributeToUserWithMembershipAndAttributesForTeam({ teamId }: { teamId: number }) {
  let log = logger.getSubLogger({ prefix: ["getAttributeToUserWithMembershipAndAttributes"] });

  const whereClauseForAttributesAssignedToMembersOfTeam = {
    member: {
      user: {
        teams: {
          some: {
            teamId,
          },
        },
      },
    },
  };

  log.debug(
    safeStringify({
      teamId,
      whereClauseForAttributesAssignedToMembersOfTeam,
    })
  );

  const attributesToUser = await prisma.attributeToUser.findMany({
    where: whereClauseForAttributesAssignedToMembersOfTeam,
    select: {
      member: {
        select: {
          userId: true,
        },
      },
      attributeOption: {
        select: {
          id: true,
          value: true,
          slug: true,
          attribute: {
            select: { id: true, name: true, type: true, slug: true },
          },
        },
      },
    },
  });

  log.debug("Returned attributesToUser", safeStringify({ attributesToUser }));
  return attributesToUser;
}

async function getAttributesAssignedToMembersOfTeam({ teamId }: { teamId: number }) {
  let log = logger.getSubLogger({ prefix: ["getAttributeToUserWithMembershipAndAttributes"] });

  const whereClauseForAttributesAssignedToMembersOfTeam =  {
    options: {
      some: {
        assignedUsers: {
          some: {
            member: {
              user: {
                teams: {
                  some: {
                    teamId,
                  },
                },
              },
            },
          },
        },
      },
    },
  }

  log.debug(
    safeStringify({
      teamId,
      whereClauseForAttributesAssignedToMembersOfTeam,
    })
  );

  const attributesToUser = await prisma.attribute.findMany({
    where: whereClauseForAttributesAssignedToMembersOfTeam,
    select: {
      id: true,
      name: true,
      type: true,
      options: {
        select: {
          id: true,
          value: true,
          slug: true,
        },
      },
      slug: true,
    },
  });
  return attributesToUser;
}

export async function getAttributesForTeam({ teamId }: { teamId: number }) {
  const attributes = await getAttributesAssignedToMembersOfTeam({ teamId });
  return attributes satisfies Attribute[];
}

type AttributeId = string;
type AttributeOptionValue = string | string[];

export async function getTeamMembersWithAttributeOptionValuePerAttribute({ teamId }: { teamId: number }) {
  const attributesToUser = await getAttributeToUserWithMembershipAndAttributesForTeam({ teamId });

  const teamMembers = attributesToUser.reduce((acc, attributeToUser) => {
    const { userId } = attributeToUser.member;
    const { attribute, value } = attributeToUser.attributeOption;

    if (!acc[userId]) {
      acc[userId] = { userId, attributes: {} };
    }

    const attributes = acc[userId].attributes;
    const attributeValue = attributes[attribute.id];
    if (attributeValue instanceof Array) {
      // Push to existing array
      attributeValue.push(value);
    } else if (attributeValue) {
      // Make it an array
      attributes[attribute.id] = [attributeValue, value];
    } else {
      // Set it as a string
      attributes[attribute.id] = value;
    }
    return acc;
  }, {} as Record<number, { userId: number; attributes: Record<AttributeId, AttributeOptionValue> }>);

  return Object.values(teamMembers);
}