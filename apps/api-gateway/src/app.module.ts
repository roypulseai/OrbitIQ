import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { SchemaResolver } from "./resolvers/schema.resolver";
import { SemanticModelsResolver } from "./resolvers/semantic-models.resolver";
import { OQLResolver } from "./resolvers/oql.resolver";
import { ExportResolver } from "./resolvers/export.resolver";
import { OrganizationsService } from "./services/organizations.service";
import { WorkspacesService } from "./services/workspaces.service";
import { UsersService } from "./services/users.service";
import { ConnectionsService } from "./services/connections.service";
import { QueryEngineService } from "./services/query-engine.service";
import { AuditService } from "./services/audit.service";
import { SemanticModelsService } from "./services/semantic-models.service";
import { DashboardsService } from "./services/dashboards.service";
import { RBACService } from "./services/rbac.service";
import { ChartRecommenderService } from "./services/chart-recommender.service";
import { OQLService } from "./services/oql.service";
import { ExportService } from "./services/export.service";

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
    SemanticModelsResolver,
    OQLResolver,
    ExportResolver,
    OrganizationsService,
    WorkspacesService,
    UsersService,
    ConnectionsService,
    QueryEngineService,
    AuditService,
    SemanticModelsService,
    DashboardsService,
    RBACService,
    ChartRecommenderService,
    OQLService,
    ExportService,
  ],
})
export class AppModule {}
