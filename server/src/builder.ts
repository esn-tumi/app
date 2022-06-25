import SchemaBuilder from '@pothos/core';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import PrismaPlugin from '@pothos/plugin-prisma';
import prisma from './client';
import PrismaTypes from './generated/pothos-types';
import { GraphQLJSON } from 'graphql-scalars';
import { Auth0 } from './helpers/auth0';
import {
  MembershipStatus,
  Prisma,
  Role,
  Tenant,
  User,
  UsersOfTenants,
} from './generated/prisma';

export const builder = new SchemaBuilder<{
  Context: {
    token?: { sub: string };
    auth0: Auth0;
    tenant: Tenant;
    user?: User;
    userOfTenant?: UsersOfTenants;
  };
  PrismaTypes: PrismaTypes;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    JSON: {
      Input: any;
      Output: any;
    };
    ID: {
      Input: string;
      Output: string;
    };
    Decimal: {
      Input: Prisma.Decimal;
      Output: Prisma.Decimal;
    };
  };
  AuthScopes: {
    authenticated: boolean;
    public: boolean;
    member: boolean;
    admin: boolean;
  };
}>({
  plugins: [ScopeAuthPlugin, PrismaPlugin, SimpleObjectsPlugin],
  authScopes: async (context) => ({
    authenticated: !!context.auth0,
    public: !!context.user,
    member: context.userOfTenant?.status !== MembershipStatus.NONE,
    admin: context.userOfTenant?.role === Role.ADMIN,
  }),
  prisma: {
    client: prisma,
  },
});

// builder.addScalarType('DateTime', GraphQLDateTime, {});
builder.addScalarType('JSON', GraphQLJSON, {});
builder.scalarType('DateTime', {
  serialize: (value) => value.toJSON(),
  parseValue: (value) => {
    if (typeof value === 'string') {
      return new Date(value);
    } else {
      throw new Error(`Invalid DateTime: ${value}`);
    }
  },
});
builder.scalarType('Decimal', {
  serialize: (value) => value.toString(),
  parseValue: (value) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Prisma.Decimal(value);
    } else {
      throw new Error(
        'Decimal scalar can only be parsed from strings or numbers'
      );
    }
  },
});

builder.queryType({});
builder.mutationType({});
