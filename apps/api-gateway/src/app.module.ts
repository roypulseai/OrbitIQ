import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { UsersModule } from "./users/users.module";
import { ConnectionsModule } from "./connections/connections.module";

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
    WorkspacesModule,
    UsersModule,
    ConnectionsModule,
  ],
})
export class AppModule {}
