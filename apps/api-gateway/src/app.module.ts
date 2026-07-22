import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { SchemaResolver } from "./resolvers/schema.resolver";
import { OrganizationsService } from "./services/organizations.service";
import { WorkspacesService } from "./services/workspaces.service";
import { UsersService } from "./services/users.service";
import { ConnectionsService } from "./services/connections.service";
import { QueryEngineService } from "./services/query-engine.service";
import { AuditService } from "./services/audit.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
  ],
  providers: [
    SchemaResolver,
    OrganizationsService,
    WorkspacesService,
    UsersService,
    ConnectionsService,
    QueryEngineService,
    AuditService,
  ],
})
export class AppModule {}
