import { Module } from "@nestjs/common";
import { WorkspacesResolver } from "./workspaces.resolver";
import { WorkspacesService } from "./workspaces.service";

@Module({
  providers: [WorkspacesResolver, WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
