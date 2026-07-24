import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { SchemaResolver } from "./resolvers/schema.resolver";
import { SemanticModelsResolver } from "./resolvers/semantic-models.resolver";
import { OQLResolver } from "./resolvers/oql.resolver";
import { ExportResolver } from "./resolvers/export.resolver";
import { RelationshipsResolver } from "./resolvers/relationships.resolver";
import { CacheResolver } from "./resolvers/cache.resolver";
import { SharingResolver } from "./resolvers/sharing.resolver";
import { EmbeddingResolver } from "./resolvers/embedding.resolver";
import { RLSResolver } from "./resolvers/rls.resolver";
import { CLSResolver } from "./resolvers/cls.resolver";
import { ComplianceResolver } from "./resolvers/compliance.resolver";
import { ProfilingResolver } from "./resolvers/profiling.resolver";
import { KnowledgeGraphResolver } from "./resolvers/knowledge-graph.resolver";
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
import { RelationshipsService } from "./services/relationships.service";
import { DataPrepService } from "./services/data-prep.service";
import { CacheService } from "./services/cache.service";
import { ScheduledRefreshService } from "./services/scheduled-refresh.service";
import { SharingService } from "./services/sharing.service";
import { EmbeddingService } from "./services/embedding.service";
import { RLSService } from "./services/rls.service";
import { UserAttributesService } from "./services/user-attributes.service";
import { CLSService } from "./services/cls.service";
import { PIIScanningService } from "./services/pii-scanning.service";
import { ComplianceService } from "./services/compliance.service";
import { AuditTrailService } from "./services/audit-trail.service";
import { ProfilingService } from "./services/profiling.service";
import { KnowledgeGraphService } from "./services/knowledge-graph.service";
import { SemanticFingerprintService } from "./services/semantic-fingerprint.service";
import { RelationshipInferenceService } from "./services/relationship-inference.service";
import { RelationshipInferenceResolver } from "./resolvers/relationship-inference.resolver";
import { ModelGenerationResolver } from "./resolvers/model-generation.resolver";
import { ModelGenerationService } from "./services/model-generation.service";
import { CrossLanguageResolver } from "./resolvers/cross-language.resolver";
import { CrossLanguageService } from "./services/cross-language.service";
import { DataCatalogResolver } from "./resolvers/data-catalog.resolver";
import { DataCatalogService } from "./services/data-catalog.service";
import { ModelGatewayResolver } from "./resolvers/model-gateway.resolver";
import { ModelGatewayService } from "./services/model-gateway.service";
import { IntentParserResolver } from "./resolvers/intent-parser.resolver";
import { IntentParserService } from "./services/intent-parser.service";
import { SemanticResolverService } from "./services/semantic-resolver.service";
import { AgentResolver } from "./resolvers/agent.resolver";
import { AgentService } from "./services/agent.service";
import { ConversationResolver } from "./resolvers/conversation.resolver";
import { ConversationService } from "./services/conversation.service";
import { AnalyticsResolver } from "./resolvers/analytics.resolver";
import { AnalyticsService } from "./services/analytics.service";
import { HypothesisResolver } from "./resolvers/hypothesis.resolver";
import { HypothesisService } from "./services/hypothesis.service";
import { ExperimentationService } from "./services/experimentation.service";

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
    RelationshipsResolver,
    CacheResolver,
    SharingResolver,
    EmbeddingResolver,
    RLSResolver,
    CLSResolver,
    ComplianceResolver,
    ProfilingResolver,
    KnowledgeGraphResolver,
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
    RelationshipsService,
    DataPrepService,
    CacheService,
    ScheduledRefreshService,
    SharingService,
    EmbeddingService,
    RLSService,
    UserAttributesService,
    CLSService,
    PIIScanningService,
    ComplianceService,
    AuditTrailService,
    ProfilingService,
    KnowledgeGraphService,
    SemanticFingerprintService,
    RelationshipInferenceService,
    RelationshipInferenceResolver,
    ModelGenerationResolver,
    ModelGenerationService,
    CrossLanguageResolver,
    CrossLanguageService,
    DataCatalogResolver,
    DataCatalogService,
    ModelGatewayResolver,
    ModelGatewayService,
    IntentParserResolver,
    IntentParserService,
    SemanticResolverService,
    AgentResolver,
    AgentService,
    ConversationResolver,
    ConversationService,
    AnalyticsResolver,
    AnalyticsService,
    HypothesisResolver,
    HypothesisService,
    ExperimentationService,
  ],
})
export class AppModule {}
