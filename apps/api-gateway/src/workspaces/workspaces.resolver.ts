import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ObjectType, Field, InputType } from "@nestjs/graphql";
import { WorkspacesService } from "./workspaces.service";

@ObjectType()
export class Workspace {
  @Field(() => ID)
  id: string;

  @Field()
  orgId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateWorkspaceInput {
  @Field()
  orgId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@Resolver(() => Workspace)
export class WorkspacesResolver {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Query(() => [Workspace], { name: "workspaces" })
  async findAll(@Args("orgId") orgId: string): Promise<Workspace[]> {
    return this.workspacesService.findAll(orgId);
  }

  @Query(() => Workspace, { name: "workspace" })
  async findOne(@Args("id", { type: () => ID }) id: string): Promise<Workspace> {
    return this.workspacesService.findOne(id);
  }

  @Mutation(() => Workspace)
  async createWorkspace(
    @Args("input") input: CreateWorkspaceInput
  ): Promise<Workspace> {
    return this.workspacesService.create(input);
  }

  @Mutation(() => Workspace)
  async updateWorkspace(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateWorkspaceInput
  ): Promise<Workspace> {
    return this.workspacesService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteWorkspace(
    @Args("id", { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.workspacesService.delete(id);
  }
}
